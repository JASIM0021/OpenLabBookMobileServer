/* eslint-disable no-unused-vars */
import { Model, ObjectId } from 'mongoose';
import { USER_ROLE } from './user.constant';

export interface TUser extends Document {
  _id: string | ObjectId;
  id: string;
  email?: string;
  contactNumber: string;
  otp: string;
  needsPasswordChange: boolean;
  passwordChangedAt?: Date;
  role: 'superAdmin' | 'admin' | 'student' | 'faculty' | 'patient';
  status: 'in-progress' | 'blocked';
  isDeleted: boolean;
  isProfileSetup: boolean;
  otpExpiresAt: Date;
}

export interface UserModel extends Model<TUser> {
  //instance methods for checking if the user exist
  isUserExistsByCustomId(id: string): Promise<TUser>;
  isUserExistsByContactNumber(contactNumber: string): Promise<TUser>;

  //instance methods for checking if passwords are matched
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}

export type TUserRole = keyof typeof USER_ROLE;
