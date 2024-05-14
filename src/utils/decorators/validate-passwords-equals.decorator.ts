import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { RegisterDto } from '../../auth/dto/register.dto';

@ValidatorConstraint({ name: 'IsPasswordEqual', async: false })
export class IsEqualPasswordConstraint implements ValidatorConstraintInterface {
  validate (passwordRepeat: string, validationArguments: ValidationArguments): boolean {
    const obj = validationArguments.object as RegisterDto;
    return obj.password === passwordRepeat;
  }

  defaultMessage (): string {
    return 'Passwords are not the same';
  }
}