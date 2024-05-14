import { BadRequestException, Body, Controller, Patch, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from '../users/entity/user.entity';
import { Public } from '../utils/decorators/skip-auth.decorator';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Request } from 'express';
import { SendResetDto } from './dto/send-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    if (!user) {
      throw new BadRequestException(`Cannot register user with data ${JSON.stringify(dto)}`);
    }
    return new UserEntity(user);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const tokens = await this.authService.login(dto);
    if (!tokens) {
      throw new BadRequestException(`Cannot login with data ${JSON.stringify(dto)}`);
    }
    return tokens;
  }

  @Public()
  @Patch('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmail(dto);
    return { message: 'email is verified' };
  }

  @Public()
  @Patch('refresh-token')
  refreshToken(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refreshToken(dto, req);
  }

  @Public()
  @Post('send-reset-password')
  async sendResetPassword(@Body() dto: SendResetDto) {
    await this.authService.sendResetPassword(dto);
    return { message: 'check your email' };
  }

  @Public()
  @Patch('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { message: 'password is changed' };
  }

  @Public()
  @Post('resend-verify-email')
  async resendVerifyEmail(@Body() dto: LoginDto) {
    await this.authService.resendVerifyEmail(dto);
    return { message: 'check your email' };
  }
}
