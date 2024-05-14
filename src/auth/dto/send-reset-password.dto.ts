import { IsEmail, IsNotEmpty, IsString, Validate } from "class-validator";

export class SendResetDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}