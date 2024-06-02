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
  
  async createQueue (queue: CreateQueueDto, creatorId: string): Promise<Queue> {
    return this.queueRepository.create(queue, creatorId);
  }

  async findQueueById (id: string): Promise<Queue> {
    const queue = await this.queueRepository.findByLabId(id);
    if (!queue) {
      return this.createQueue({ labId: id } as CreateQueueDto);
    }
    return queue;
  }

  async findAllQueuesByLabId (labId: string): Promise<Queue[]> {
    return this.queueRepository.findAllByLabId(labId);
  }

  async deleteQueueById (id: string, req: Request): Promise<Queue> {
    const userId = req['user'].userId;
    const isAdmin = await this.userService.isAdmin(userId);

    const queue = await this.findQueueById(id);
    if (!isAdmin) {
      throw new ForbiddenException('You do not have permission to delete this queue');
    }

    return this.queueRepository.deleteById(queue.id);
  }

  async joinQueue (queueId: string, req: Request): Promise<UserQueue> {
    const queue = await this.findQueueById(queueId);
    if (queue.status !== 'PENDING') throw new ForbiddenException('You cannot join the queue');

    const userId = req['user'].userId;

    const userInQueue = await this.queueRepository.findUserInQueue(queue.id, userId);
    if (userInQueue) throw new ConflictException(`You have already joined this queue`);

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