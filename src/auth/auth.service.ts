import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersRepository } from '../repositories/users.repository';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository, 
    private readonly mailService: MailService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (user) {
      throw new ConflictException('A user with this email already exists');
    }
    delete dto.passwordRepeat;
    const hashedPassword = await this.hashPassword(dto.password);
    dto.password = hashedPassword;
    const token = uuidv4();
    const expireDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const verifiedToken = `${token}::email::${expireDate}`;
    dto['verifiedToken'] = verifiedToken;
    const url = process.env.FRONTEND_DOMAIN + 'verify-email/' + token;
    await this.mailService.sendVerifyEmail(dto.email, url);
    return this.usersRepository.create(dto);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByEmail(dto.email);
    if (!user) {
      throw new NotFoundException(`No user found for email: ${dto.email}`);
    }
    if (user.verifiedToken !== null && user.verifiedToken.includes('::email::')) {
      throw new UnauthorizedException('Verify email');
    }
    if (!user.approved) {
      throw new UnauthorizedException('You are not approved by administrator');
    }
    const isPasswordsValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordsValid) {
      throw new UnauthorizedException('Invalid password');
    }
    const tokens = this.getTokens(user.id, user.email, user.password);
    await this.usersRepository.update(user.id, { refreshToken: tokens.refreshToken });
    return tokens;
  }

  private getTokens(userId: string, email: string, password: string) {
    return {
      accessToken: this.jwtService.sign({
        userId,
        hash: this.getHash(email, password),
      }),
      refreshToken: uuidv4()
    }
  }

  getHash(...params) {
    return crypto.createHash('md5').update(params.join()).digest('hex');
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, await bcrypt.genSalt(10))
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token: undefined;
  }
}
