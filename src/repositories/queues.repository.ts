import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQueueDto } from '../queues/dto/create-queue.dto';

@Injectable()

export class QueuesRepository {
  constructor (private readonly prisma: PrismaService) {}
  
  async create (createQueueDto: CreateQueueDto) {
    const { creatorId, labId, status } = createQueueDto;
    return this.prisma.queue.create({
      data: {
        creatorId,
        labId,
        status,
      },
    });
  }

  async findById (id: string) {
    return this.prisma.queue.findUnique({
      where: { id },
    });
  }
}