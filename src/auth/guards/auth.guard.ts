import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../../utils/decorators/skip-auth.decorator';
import { UsersRepository } from '../../repositories/users.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor (
    private readonly jwtService: JwtService, 
    private readonly reflector: Reflector,
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
  ) {}
  
  async canActivate (context: ExecutionContext): Promise<boolean> {
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSkipAuth) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.authService.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET })
      .catch((err) => {
        throw new UnauthorizedException(); 
      });
    const user = await this.usersRepository.findById(payload.userId);
    const hash = this.authService.getHash(user.email, user.password);
    if (hash !== payload.hash) {
      throw new UnauthorizedException('Login with new credentials');
    }
    request['user'] = payload;

    return true;
  }
}