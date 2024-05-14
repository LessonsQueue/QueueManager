import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  sendVerifyEmail(email: string, url: string) {
    this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './verify-email',
      context: {
        url,
      },
    });
  }

  sendResetPassword(email: string, url: string) {
    this.mailerService.sendMail({
      to: email,
      subject: 'Reset password',
      template: './reset-pass',
      context: {
        url,
      },
    });
  }
}
