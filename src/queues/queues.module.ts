import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { QueuesService } from './queues.service';
import { QueuesController } from './queue.controller';
import { QueuesRepository } from '../repositories/queues.repository';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../repositories/users.repository';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, UsersModule, MailModule, AuthModule],
  providers: [QueuesService, QueuesRepository, UsersService, UsersRepository],
  controllers: [QueuesController],
})
export class QueueModule {}