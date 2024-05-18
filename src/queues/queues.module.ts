import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { QueuesService } from './queues.service';
import { QueuesController } from './queue.controller';
import { QueuesRepository } from '../repositories/queues.repository';

@Module({
  imports: [PrismaModule],
  providers: [QueuesService, QueuesRepository],
  controllers: [QueuesController],
})
export class QueueModule {}