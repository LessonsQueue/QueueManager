import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor (private readonly prisma: PrismaService) {}

  findByEmail (email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findById (id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  findByRefreshToken (refreshToken: string) {
    return this.prisma.user.findFirst({
      where: { refreshToken },
    });
  }

  findAllNotApproved () {
    return this.prisma.user.findMany({
      where: { approved: false },
    });
  }

  findByVerifiedTokenContains (token: string, type: string) {
    return this.prisma.user.findFirst({
      where: {
        verifiedToken: {
          contains: `${token}::${type}::`,
        },
      },
    });
  }

  create (dto: RegisterDto) {
    return this.prisma.user.create({
      data: dto,
    });
  }

  update (id: string, data: Partial<User>) {
    return this.prisma.user.update({
      where: { id },
      data: data,
    });
  }
}