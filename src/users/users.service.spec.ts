import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from '../repositories/users.repository';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, UsersRepository],
      imports: [MailModule, PrismaModule, AuthModule],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  beforeEach(async () => {
    await prismaService.queue.deleteMany();
    await prismaService.user.deleteMany();
  });

  describe('getNotApprovedUsers', () => {
    it('should return a list of not approved users if the requester is an admin', async () => {
      const admin = await prismaService.user.create({
        data: {
          email: 'oleg@lll.kpi.ua',
          password: '123456',
          firstName: 'John',
          lastName: 'Doe',
          admin: true,
          approved: true,
        },
      });


      await prismaService.user.createMany({
        data: [
          {
            email: 'notapproved_oleg@lll.kpi.ua',
            password: '123456',
            firstName: 'John',
            lastName: 'Doe',
            admin: false,
            approved: false,
          },
          {
            email: 'notapproved_andrew@lll.kpi.ua',
            password: '123456',
            firstName: 'Andrew',
            lastName: 'Doe',
            admin: false,
            approved: false,
          },
        ],
      });

      const notApprovedUsers = await prismaService.user.findMany({
        where: { approved: false },
      });

      const req = {
        user: {
          userId: admin.id,
        },
      } as unknown as Request;

      const result = await usersService.getNotApprovedUsers(req);
      expect(result).toStrictEqual(notApprovedUsers);
    });
  });
});
