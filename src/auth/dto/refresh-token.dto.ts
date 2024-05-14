import { IsEmail, IsNotEmpty, IsString, MinLength, Validate } from "class-validator";

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}