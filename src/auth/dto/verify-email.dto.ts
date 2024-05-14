import { IsEmail, IsNotEmpty, IsString, MinLength, Validate } from "class-validator";

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}