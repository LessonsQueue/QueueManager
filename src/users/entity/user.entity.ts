import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  
  @Exclude()
    password: string;

  @Exclude()
    admin: boolean;

  @Exclude()
    approved: boolean;

  @Exclude()
    createdAt: Date;

  @Exclude()
    updatedAt: Date;

  @Exclude()
    refreshToken: string;

  @Exclude()
    verifiedToken: string;
  
  constructor (partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}