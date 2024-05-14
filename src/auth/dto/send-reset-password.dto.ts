import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendResetDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
    email: string;
}