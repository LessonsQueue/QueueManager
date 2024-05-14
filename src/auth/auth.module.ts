import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersRepository } from '../repositories/users.repository';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    MailModule,
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    })
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    UsersRepository,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    },
  ],
})
export class AuthModule {}
