import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { Request } from 'express';
import { ApproveUserDto } from './dto/approve-user.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository, private readonly mailService: MailService) {}

  async getNotApprovedUsers(req: Request) {
    if (!await this.isAdmin(req['user'].userId)) {
      throw new ForbiddenException();
    }
    return this.usersRepository.findAllNotApproved();
  }

  async approveUser(dto: ApproveUserDto, req: Request) {
    if (!await this.isAdmin(req['user'].userId)) {
      throw new ForbiddenException();
    }
    const user = await this.usersRepository.findById(dto.id);
    if (!user) {
      throw new NotFoundException(`No user with id: ${dto.id}`);
    }
    if (user.approved) {
      throw new ConflictException(`User with id ${user.id} is already approved`);
    }
    const approvedUser = await this.usersRepository.update(dto.id, { approved: true });
    const loginUrl = process.env.FRONTEND_DOMAIN + '/sign-in';
    return this.mailService.sendApprovedUser(approvedUser.email, loginUrl, approvedUser.firstName, approvedUser.lastName);
  }

  private async isAdmin(userId: string) {
    const userAdmin = await this.usersRepository.findById(userId);
    return userAdmin.admin;
  }
}
