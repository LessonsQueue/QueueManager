import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { QueueStatus } from '@prisma/client';

export class CreateQueueDto {
  @IsString()
  @IsNotEmpty()
    creatorId: string;

  @IsString()
  @IsNotEmpty()
    labId: string;

  @IsOptional()
  @IsEnum(QueueStatus)
    status?: QueueStatus;
}