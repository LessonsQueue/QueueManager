import { IsNotEmpty, IsString } from 'class-validator';

export class ApproveUserDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}