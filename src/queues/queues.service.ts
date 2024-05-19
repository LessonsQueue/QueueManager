import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { QueuesRepository } from '../repositories/queues.repository';
import { Queue, UserQueue } from '@prisma/client';
import { CreateQueueDto } from './dto/create-queue.dto';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class QueuesService {
  constructor (
    private readonly queueRepository: QueuesRepository,
    private readonly userService: UsersService,
  ) {}
  
  async createQueue (queue: CreateQueueDto): Promise<Queue> {
    return this.queueRepository.create(queue);
  }

  async findQueueById (id: string): Promise<Queue> {
    const queue = await this.queueRepository.findById(id);
    if (!queue) throw new NotFoundException(`Queue with this ${id} id was not found`);
    return queue;
  }

  async deleteQueueById (id: string, req: Request): Promise<Queue> {
    const userId = req['user'].userId;
    const isAdmin = await this.userService.isAdmin(userId);

    const queue = await this.findQueueById(id);
    if (!isAdmin && queue.creatorId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this queue');
    }

    return this.queueRepository.deleteById(queue.id);
  }

  async joinQueue (queueId: string, req: Request): Promise<UserQueue> {
    const queue = await this.findQueueById(queueId);
    if (queue.status !== 'PENDING') throw new ForbiddenException('You cannot join the queue');

    const userId = req['user'].userId;

    const userInQueue = await this.queueRepository.findUserInQueue(queue.id, userId);
    if (userInQueue) throw new ConflictException(`User with id ${userId} has already been found in queue`);

    return this.queueRepository.addUserToQueue(queue.id, userId);
  }

  async leaveQueue (queueId: string, req: Request): Promise<UserQueue> {
    const queue = await this.findQueueById(queueId);
    const userId = req['user'].userId;

    const userInQueue = await this.queueRepository.findUserInQueue(queue.id, userId);
    if (!userInQueue) throw new NotFoundException(`User with id ${userId} was not found in queue`);

    return this.queueRepository.removeUserFromQueue(queue.id, userId);
  }

  async removeUserFromQueue (queueId: string, req: Request, removedUserId: string): Promise<UserQueue> {
    const isAdmin = await this.userService.isAdmin(req['user'].userId);
    if (!isAdmin) throw new ForbiddenException('You do not have permission to perform this action');

    const queue = await this.findQueueById(queueId);
    const userInQueue = await this.queueRepository.findUserInQueue(queue.id, removedUserId);
    if (!userInQueue) throw new NotFoundException(`User with id ${removedUserId} was not found in queue`);

    return this.queueRepository.removeUserFromQueue(queue.id, removedUserId);
  }

  async resumeQueueStatus (queueId: string, req: Request) {
    const isAdmin = await this.userService.isAdmin(req['user'].userId);
    if (!isAdmin) throw new ForbiddenException('You do not have permission to perform this action');

    const queue = await this.findQueueById(queueId);
    if (queue.status === 'PENDING') throw new ConflictException(`Queue ${queueId} has already had status 'PENDING'`);

    return await this.queueRepository.updateQueueStatus(queueId, 'PENDING');
  }

}