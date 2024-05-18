import { Injectable, NotFoundException } from '@nestjs/common';
import { QueuesRepository } from '../repositories/queues.repository';
import { Queue } from '@prisma/client';
import { CreateQueueDto } from './dto/create-queue.dto';

@Injectable()
export class QueuesService {
  constructor (private readonly queueRepository: QueuesRepository) {}
  
  async createQueue (queue: CreateQueueDto): Promise<Queue> {
    return this.queueRepository.create(queue);
  }

  async findById (id: string): Promise<Queue> {
    const queue = await this.queueRepository.findById(id);
    if (!queue) throw new NotFoundException('Queue with this ${id} was not found');
    return queue;
  }
}