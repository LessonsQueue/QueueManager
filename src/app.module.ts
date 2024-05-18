import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { QueueModule } from './queues/queues.module';

@Module({
  imports: [AuthModule, UsersModule, PrismaModule, MailModule, QueueModule],
})
export class AppModule {}
