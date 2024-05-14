import { IsEmail, IsNotEmpty, IsString, MinLength, Validate } from "class-validator";
import { IsEqualPasswordConstraint } from "../../utils/decorators/validate-passwords-equals.decorator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Validate(IsEqualPasswordConstraint)
  passwordRepeat: string;
  
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  lastName: string;
}