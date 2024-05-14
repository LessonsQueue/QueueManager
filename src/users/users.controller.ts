import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import { ApproveUserDto } from './dto/approve-user.dto';
import { UserEntity } from './entity/user.entity';

@Controller('users')
export class UsersController {
  constructor (private readonly usersService: UsersService) {}

  @Get('not-approved')
  async getNotApprovedUsers(@Req() req: Request) {
    const users = await this.usersService.getNotApprovedUsers(req);
    return users.map(user => new UserEntity(user));
  }

  @Post('approve')
  async approveUser(@Body() dto: ApproveUserDto, @Req() req: Request) {
    await this.usersService.approveUser(dto, req);
    return { message: `User with id: ${dto.id} is approved` };
  }

  @Get('me')
  async getMyInfo(@Req() req: Request) {
    const user = await this.usersService.getMyInfo(req);
    return new UserEntity(user);
  }
}
