import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { CreateQueueDto } from './dto/create-queue.dto';
import { Public } from '../utils/decorators/skip-auth.decorator';

@Controller('queues')
export class QueuesController {
  constructor (private readonly queuesService: QueuesService) {}

  @Public()
  @Post()
  async createQueue (@Body() createQueueDto: CreateQueueDto) {
    return this.queuesService.createQueue(createQueueDto);
  }

  @Public()
  @Get(':id')
  async findById (@Param('id') id: string) {
    return await this.queuesService.findById(id);
  }
}