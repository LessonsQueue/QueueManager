import { IsEmail, IsNotEmpty, IsString, Matches, MinLength, Validate } from 'class-validator';
import { IsEqualPasswordConstraint } from '../../utils/decorators/validate-passwords-equals.decorator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@lll\.kpi\.ua$/, { message: 'email must be in @lll.kpu.ua domain' })
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