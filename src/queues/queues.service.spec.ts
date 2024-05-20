import { Test, TestingModule } from '@nestjs/testing';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { QueuesService } from './queues.service';
import { QueuesRepository } from '../repositories/queues.repository';
import { UsersService } from '../users/users.service';
import { UsersRepository } from '../repositories/users.repository';
import { UsersModule } from '../users/users.module';
import { CreateQueueDto } from './dto/create-queue.dto';
import { NotFoundException } from '@nestjs/common';
import { Request } from 'express';

describe('QueuesService', () => {
  let prismaService: PrismaService;
  let queuesService: QueuesService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueuesService, QueuesRepository, UsersService, UsersRepository],
      imports: [PrismaModule, UsersModule, MailModule, AuthModule],
    }).compile();

    queuesService = module.get<QueuesService>(QueuesService);
    prismaService = module.get<PrismaService>(PrismaService);

  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  beforeEach(async () => {
    await prismaService.queue.deleteMany();
    await prismaService.user.deleteMany();
  });

  describe('createQueue', () => {
    it('should create a queue', async () => {
      const user = await prismaService.user.create({
        data: {
          email: 'oleg@lll.kpi.ua',
          password: '123456',
          firstName: 'John',
          lastName: 'Doe',
          admin: false,
          approved: true,
        },
      });

      const queueDto: CreateQueueDto = {
        creatorId: user.id,
        labId: 'lab1',
      };
      const queue = await queuesService.createQueue(queueDto);

      expect(queue).toHaveProperty('id');
      expect(queue.creatorId).toBe(user.id);
      expect(queue.labId).toBe('lab1');
    });
  });

  describe('findQueueById', () => {
    it('should find a queue', async () => {
      const user = await prismaService.user.create({
        data: {
          email: 'alen@lll.kpi.ua',
          password: '123456',
          firstName: 'Oleg',
          lastName: 'Len',
          admin: false,
          approved: true,
        },
      });

      const queue = await queuesService.createQueue({
        creatorId: user.id,
        labId: 'lab2',
      });

      const foundQueue = await queuesService.findQueueById(queue.id);

      expect(foundQueue).toBeTruthy();
      expect(foundQueue.id).toBe(queue.id);
    });

    it('should throw NotFoundException if queue is not found', async () => {
      const queueId = 'nonexistent-id';
      await expect(queuesService.findQueueById(queueId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteQueueById', () => {
    it('should allow admin to delete a queue', async () => {
      const admin = await prismaService.user.create({
        data: {
          email: 'macho@lll.kpi.ua',
          password: 'macho123',
          firstName: 'Max',
          lastName: 'Mach',
          admin: true,
          approved: true,
        },
      });

      const req = {
        user: {
          userId: admin.id,
        },
      } as unknown as Request;

      const queue = await queuesService.createQueue({
        creatorId: admin.id,
        labId: 'lab3',
      });

      const deletedQueue = await queuesService.deleteQueueById(queue.id, req);
      expect(deletedQueue).toStrictEqual(queue);
    });
  });
});
