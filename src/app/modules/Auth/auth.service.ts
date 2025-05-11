/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import config from '../../config';
import AppError from '../../errors/AppError';
import { sendEmail, sendOtp, sendSMS } from '../../utils/sendEmail';
import { IPatient } from '../Patient/patient.interface';
import { PatientModel } from '../Patient/patient.model';
import { TUser } from '../User/user.interface';
import { User } from '../User/user.model';
import { generateOtp, generatePatientId } from '../User/user.utils';
import { TLoginUser, TVerifyOtpUser } from './auth.interface';
import { createToken, verifyToken } from './auth.utils';

const loginUser = async (payload: TLoginUser) => {
  // create a user object
  const userData: Partial<TUser> = {};
  //set Patient role
  userData.role = 'patient';
  // set Patient contactNumber
  userData.contactNumber = payload.contactNumber;

  const OTP_EXPIRATION = 15 * 60 * 1000; // 15 minutes in milliseconds
  // Set OTP expiration time
  userData.otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION);
  let otp = generateOtp();

  userData.otp = otp;

  // await sendSMS(`+91${userData.contactNumber}`, `Your otp is: ${otp}`);

  // const cleanedContactNumber = userData.contactNumber.startsWith('91')
  //   ? userData.contactNumber.slice(2)
  //   : userData.contactNumber;

  await sendOtp(`${userData.contactNumber}`, otp);

  try {
    // checking if the user is exist
    const user = await User.isUserExistsByContactNumber(payload.contactNumber);

    if (!user) {
      //set  generated id
      userData.id = await generatePatientId();
      const newUser = await User.create(userData);
      return newUser;
    }
    // checking if the user is already deleted

    const isDeleted = user?.isDeleted;

    if (isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
    }

    // checking if the user is blocked

    const userStatus = user?.status;

    if (userStatus === 'blocked') {
      throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
    }

    const updatedUser = await User.findOneAndUpdate({ id: user.id }, userData, {
      new: true,
      upsert: true,
    }).select('+otp -needsPasswordChange');

    return updatedUser;
  } catch (err: any) {
    throw new Error(err);
  }
};

const VerifyOtpUser = async (payload: TVerifyOtpUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByContactNumber(payload.contactNumber);
  console.log('user', user);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }
  // checking if the user is already deleted

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  console.log('payload.otp', user.otp == payload.otp);

  if (payload.otp !== user.otp) {
    throw new AppError(httpStatus.FORBIDDEN, 'Invalid OTP!');
  }

  // create a user object
  const userData: Partial<TUser & IPatient> = {};

  //set student role
  userData.role = 'patient';
  // set student contactNumber
  userData.contactNumber = payload.contactNumber;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    //set  generated id

    // create a user (transaction-1)
    // const updatedUser = await User.create([userData], { session }); // array
    const updatedUser = await User.findOneAndUpdate(
      { id: user.id },
      { otp: '', otpExpiresAt: '' },
      { session, new: true },
    );

    console.log('updatedUser', updatedUser);

    //create a student
    if (!updatedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update user');
    }
    userData.user = updatedUser._id as any; //reference _id
    userData.id = user.id; //reference _id
    console.log('userData._id', user._id);
    const exitingPatient = await PatientModel.findOne({ user: user._id });

    console.log('exitingPatient', exitingPatient);
    let newPatient = [exitingPatient];
    if (!exitingPatient) {
      // create a student (transaction-2)

      newPatient = await PatientModel.create([userData], { session });

      console.log('newPatient', newPatient);
      if (!newPatient.length) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create Patient');
      }
    }

    await session.commitTransaction();
    await session.endSession();

    const jwtPayload = {
      userId: user.id,
      role: user.role,
    };

    const accessToken = createToken(
      jwtPayload,
      config.jwt_access_secret as string,
      config.jwt_access_expires_in as string,
    );

    const refreshToken = createToken(
      jwtPayload,
      config.jwt_refresh_secret as string,
      config.jwt_refresh_expires_in as string,
    );

    return {
      accessToken,
      refreshToken,
      needsPasswordChange: user?.needsPasswordChange,
      user: updatedUser,
      patient: newPatient?.[0],
    };
  } catch (err: any) {
    console.log('err', err);

    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

const VerifyAdminOtpUser = async (payload: TVerifyOtpUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByContactNumber(payload.contactNumber);
  console.log(user, 'useruser');
  // if (!user) {
  //   throw new AppError(httpStatus.NOT_FOUND, "This user is not found!");
  // }
  // checking if the user is already deleted

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const changePassword = async (
  userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByCustomId(userData.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted

  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  //checking if the password is correct

  // if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
  //   throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      id: userData.userId,
      role: userData.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );

  return null;
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { userId, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByCustomId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

const forgetPassword = async (userId: string) => {
  // checking if the user is exist
  const user = await User.isUserExistsByCustomId(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
  };

  const resetToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    '10m',
  );

  const resetUILink = `${config.reset_pass_ui_link}?id=${user.id}&token=${resetToken} `;

  // sendEmail(user.email, resetUILink);
  sendEmail(user.contactNumber, resetUILink, '', '');
};

const resetPassword = async (
  payload: { id: string; newPassword: string },
  token: string,
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByCustomId(payload?.id);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found !');
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted !');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked ! !');
  }

  const decoded = jwt.verify(
    token,
    config.jwt_access_secret as string,
  ) as JwtPayload;

  //localhost:3000?id=A-0001&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJBLTAwMDEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDI4NTA2MTcsImV4cCI6MTcwMjg1MTIxN30.-T90nRaz8-KouKki1DkCSMAbsHyb9yDi0djZU3D6QO4

  if (payload.id !== decoded.userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden!');
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      id: decoded.userId,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      needsPasswordChange: false,
      passwordChangedAt: new Date(),
    },
  );
};

export const AuthServices = {
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword,
  VerifyOtpUser,
  VerifyAdminOtpUser,
};
