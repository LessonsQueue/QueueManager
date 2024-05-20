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
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
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

    it('should allow a creator to delete a queue', async () => {
      const creator = await prismaService.user.create({
        data: {
          email: 'antbod@lll.kpi.ua',
          password: 'pavlovvg',
          firstName: 'Botik',
          lastName: 'Pav',
          admin: false,
          approved: true,
        },
      });

      const req = {
        user: {
          userId: creator.id,
        },
      } as unknown as Request;

      const queue = await queuesService.createQueue({
        creatorId: creator.id,
        labId: 'lab4',
      });

      const deletedQueue = await queuesService.deleteQueueById(queue.id, req);
      expect(deletedQueue).toStrictEqual(queue);
    });

    it('should throw ForbiddenException if user is not admin or creator', async () => {
      const user = await prismaService.user.create({
        data: {
          email: 'random@lll.kpi.ua',
          password: 'random123',
          firstName: 'Anon',
          lastName: 'Stranger',
          admin: false,
          approved: true,
        },
      });

      const creator = await prismaService.user.create({
        data: {
          email: 'creator@lll.kpi.ua',
          password: 'creator123',
          firstName: 'Creator',
          lastName: 'Test',
          admin: false,
          approved: true,
        },
      });

      const req = {
        user: {
          userId: user.id,
        },
      } as unknown as Request;

      const queue = await queuesService.createQueue({
        creatorId: creator.id,
        labId: 'lab5',
      });

      await expect(queuesService.deleteQueueById(queue.id, req)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('joinQueue', () => {
    it('should allow user to join a queue', async () => {
      const user = await prismaService.user.create({
        data: {
          email: 'joined@lll.kpi.ua',
          password: 'joined123',
          firstName: 'Antin',
          lastName: 'Banderas',
          admin: false,
          approved: true,
        },
      });

      const req = {
        user: {
          userId: user.id,
        },
      } as unknown as Request;

      const queue = await queuesService.createQueue({
        creatorId: user.id,
        labId: 'lab6',
        status: 'PENDING',
      });

      const joinedQueue = await queuesService.joinQueue(queue.id, req);
      expect(joinedQueue).toStrictEqual(
        {
          updatedAt: expect.any(Date),
          createdAt: expect.any(Date),
          queueId: queue.id,
          userId: queue.creatorId,
        }
      );
    });

    it('should throw ForbiddenException if the queue status is not PENDING', async () => {
      const user = await prismaService.user.create({
        data: {
          email: 'newuser@lll.kpi.ua',
          password: 'aboba123',
          firstName: 'John',
          lastName: 'Bandera',
          admin: false,
          approved: true,
        },
      });

      const req = {
        user: {
          userId: user.id,
        },
      } as unknown as Request;

      const queue = await queuesService.createQueue({
        creatorId: user.id,
        labId: 'lab7',
        status: 'SKIPPED',
      });

      await expect(queuesService.joinQueue(queue.id, req)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if the the user has already been added to the queue', async () => {
      const user = await prismaService.user.create({
        data: {
          email: 'olduser@lll.kpi.ua',
          password: 'papich123',
          firstName: 'Vilaliy',
          lastName: 'Zahl',
          admin: false,
          approved: true,
        },
      });

      const req = {
        user: {
          userId: user.id,
        },
      } as unknown as Request;

      const queue = await queuesService.createQueue({
        creatorId: user.id,
        labId: 'lab8',
        status: 'PENDING',
      });

      await queuesService.joinQueue(queue.id, req);
      await expect(queuesService.joinQueue(queue.id, req)).rejects.toThrow(ConflictException);
    });
  });
});
