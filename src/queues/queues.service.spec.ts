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
        labId: 'lab1',
      };
      const queue = await queuesService.createQueue(queueDto, user.id);

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

      const queue = await queuesService.createQueue({ labId: 'lab2' }, user.id);

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

      const queue = await queuesService.createQueue({ labId: 'lab3' }, admin.id);

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

      const queue = await queuesService.createQueue({ labId: 'lab4' }, creator.id);

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

      const queue = await queuesService.createQueue({ labId: 'lab5' }, creator.id);

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
        labId: 'lab6',
        status: 'PENDING',
      }, user.id);

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
        labId: 'lab7',
        status: 'SKIPPED',
      }, user.id);

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
        labId: 'lab8',
        status: 'PENDING',
      }, user.id);

      await queuesService.joinQueue(queue.id, req);
      await expect(queuesService.joinQueue(queue.id, req)).rejects.toThrow(ConflictException);
    });
  });

  describe('leaveQueue', () => {
    it('should allow user to leave a queue', async () => {
      const user = await prismaService.user.create({
        data: {
          email: 'joined@lll.kpi.ua',
          password: 'joined123',
          firstName: 'Marco',
          lastName: 'Polo',
          admin: false,
          approved: true,
        },
      });

      const req = {
        user: {
          userId: user.id,
        },
      } as unknown as Request;

      const queue = await queuesService.createQueue({ labId: 'lab9' }, user.id);

      await queuesService.joinQueue(queue.id, req);

      const leavedQueue = await queuesService.leaveQueue(queue.id, req);
      expect(leavedQueue).toStrictEqual(
        {
          updatedAt: expect.any(Date),
          createdAt: expect.any(Date),
          queueId: queue.id,
          userId: queue.creatorId,
        }
      );
    });

    it('should throw NotFoundException if the user is not in the queue', async () => {
      const user = await prismaService.user.create({
        data: {
          email: 'john_lennon@lll.kpi.ua',
          password: 'lenn81280',
          firstName: 'John',
          lastName: 'Lennon',
          admin: false,
          approved: true,
        },
      });

      const req = {
        user: {
          userId: user.id,
        },
      } as unknown as Request;

      const queue = await queuesService.createQueue({ labId: 'lab10' }, user.id);

      await expect(queuesService.leaveQueue(queue.id, req)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeUserFromQueue', () => {
    it('should allow admin to remove user from queue ', async () => {
      const admin = await prismaService.user.create({
        data: {
          email: 'admin@lll.kpi.ua',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'Smith',
          admin: true,
          approved: true,
        },
      });

      const user = await prismaService.user.create({
        data: {
          email: 'user@lll.kpi.ua',
          password: 'user123',
          firstName: 'John',
          lastName: 'Doe',
          admin: false,
          approved: true,
        },
      });

      const req = {
        user: {
          userId: admin.id,
        },
      } as unknown as Request;

      const queue = await queuesService.createQueue({ labId: 'lab11' }, user.id);

      await queuesService.joinQueue(queue.id, {
        user: {
          userId: user.id,
        },
      } as unknown as Request);

      const removedUserFromQueue = await queuesService.removeUserFromQueue(queue.id, req, user.id);
      expect(removedUserFromQueue).toStrictEqual(
        {
          updatedAt: expect.any(Date),
          createdAt: expect.any(Date),
          queueId: queue.id,
          userId: queue.creatorId,
        }
      );
    });

    it('should throw ForbiddenException if user is not admin', async () => {
      const user = await prismaService.user.create({
        data: {
          email: 'user@lll.kpi.ua',
          password: 'user123',
          firstName: 'John',
          lastName: 'Doe',
          admin: false,
          approved: true,
        },
      });

      const userToRemove = await prismaService.user.create({
        data: {
          email: 'removed@lll.kpi.ua',
          password: 'removed123',
          firstName: 'Paul',
          lastName: 'REM',
          admin: false,
          approved: true,
        },
      });

      const req = {
        user: {
          userId: user.id,
        },
      } as unknown as Request;

      const queue = await queuesService.createQueue({ labId: 'lab12' }, user.id);

      await queuesService.joinQueue(queue.id, {
        user: {
          userId: userToRemove.id,
        },
      } as unknown as Request);

      await expect(queuesService.removeUserFromQueue(queue.id, req, userToRemove.id)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if the user is not in the queue, while removing this user', async () => {
      const admin = await prismaService.user.create({
        data: {
          email: 'MaSach@lll.kpi.ua',
          password: 'next_monitor6565',
          firstName: 'Mxee',
          lastName: 'Machok',
          admin: true,
          approved: true,
        },
      });

      const user = await prismaService.user.create({
        data: {
          email: 'user@lll.kpi.ua',
          password: 'user123',
          firstName: 'John',
          lastName: 'Doe',
          admin: false,
          approved: true,
        },
      });

      const req = {
        user: {
          userId: admin.id,
        },
      } as unknown as Request;

      const queue = await queuesService.createQueue({ labId: 'lab13' }, user.id);

      await expect(queuesService.leaveQueue(queue.id, req)).rejects.toThrow(NotFoundException);
    });
  });

  describe('resumeQueueStatus', () => {
    it('should allow admin to resume queue status to PENDING', async () => {
      const admin = await prismaService.user.create({
        data: {
          email: 'MaSach@lll.kpi.ua',
          password: 'next_monitor6565',
          firstName: 'Max',
          lastName: 'Machok',
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
        labId: 'lab14',
        status: 'COMPLETED',
      }, admin.id);

      await queuesService.resumeQueueStatus(queue.id, req);
      const updatedQueue = await queuesService.findQueueById(queue.id);
      expect(updatedQueue.status).toBe('PENDING');
    });

    it('should throw ForbiddenException if user is not admin', async () => {
      const user = await prismaService.user.create({
        data: {
          email: 'simple_user@lll.kpi.ua',
          password: 'monitor6565',
          firstName: 'Sancho',
          lastName: 'Koval',
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
        labId: 'lab15',
        status: 'SKIPPED',
      }, user.id);

      await expect(queuesService.resumeQueueStatus(queue.id, req)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if queue status is already PENDING', async () => {
      const admin = await prismaService.user.create({
        data: {
          email: 'MaSach@lll.kpi.ua',
          password: 'next_monitor6565',
          firstName: 'Max',
          lastName: 'Machok',
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
        labId: 'lab16',
        status: 'PENDING',
      }, admin.id);

      await expect(queuesService.resumeQueueStatus(queue.id, req)).rejects.toThrow(ConflictException);
    });
  });
});
