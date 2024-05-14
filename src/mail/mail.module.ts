import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';

@Module({
  imports: [MailerModule.forRoot({
    transport: {
      host: process.env.MAIL_SMTP,
      port: +process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_NAME,
        pass: process.env.MAIL_PASS,
      }
    },
    defaults: {
      from: process.env.MAIL_NAME,
    },
    template: {
      dir: join(__dirname, 'templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true
      }
    }
  })],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
