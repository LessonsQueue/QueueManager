import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { Public } from '../utils/decorators/skip-auth.decorator';
import { Request } from 'express';

@Controller('queues')
export class QueuesController {
  constructor (private readonly queuesService: QueuesService) {}

  @Post()
  async createQueue (@Body() createQueueDto: CreateQueueDto) {
    return this.queuesService.createQueue(createQueueDto);
  }

  @Public()
  @Get(':id')
  async findQueueById (@Param('id') id: string) {
    return await this.queuesService.findQueueById(id);
  }

  @Delete(':id')
  async deleteQueueById (@Param('id') id: string, @Req() req: Request) {
    return this.queuesService.deleteQueueById(id, req);
  }

  @Post(':id/join')
  async joinQueue (@Param('id') queueId: string, @Req() req: Request) {
    return this.queuesService.joinQueue(queueId, req);
  }

  @Delete(':id/leave')
  async leaveQueue (@Param('id') queueId: string, @Req() req: Request) {
    return this.queuesService.leaveQueue(queueId, req);
  }

  @Delete(':queueId/remove/:removedUserId')
  async removeUserFromQueue (
    @Param('queueId') queueId: string,
    @Param('removedUserId') removedUserId: string,
    @Req() req: Request,
  ) {
    return this.queuesService.removeUserFromQueue(queueId, req, removedUserId);
  }

  @Patch(':id/resume-status')
  async resumeQueueStatus (@Param('id') queueId: string, @Req() req: Request) {
    await this.queuesService.resumeQueueStatus(queueId, req);
    return { message: `Queue with id ${queueId} has changed its status to 'PENDING'` };
  }
}