import { IsNotEmpty, IsString, MinLength, Validate } from "class-validator";
import { IsEqualPasswordConstraint } from "../../utils/decorators/validate-passwords-equals.decorator";

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @Validate(IsEqualPasswordConstraint)
  passwordRepeat: string;
}