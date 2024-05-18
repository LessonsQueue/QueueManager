import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQueueDto } from '../queues/dto/create-queue.dto';
import { QueueStatus } from '@prisma/client';

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

  async deleteById (id: string) {
    return this.prisma.queue.delete({
      where: { id },
    });
  }

  async addUserToQueue (queueId: string, userId: string) {
    return this.prisma.userQueue.create({
      data: {
        queueId,
        userId,
      },
    });
  }

  async removeUserFromQueue (queueId: string, userId: string) {
    return this.prisma.userQueue.delete({
      where: {
        queueId_userId: {
          queueId,
          userId,
        },
      },
    });
  }

  async findUserInQueue (queueId: string, userId: string) {
    return this.prisma.userQueue.findUnique({
      where: {
        queueId_userId: {
          queueId,
          userId,
        },
      },
    });
  }

  async updateQueueStatus (queueId: string, status: QueueStatus): Promise<void> {
    await this.prisma.queue.update({
      where: { id: queueId },
      data: { status },
    });
  }
}