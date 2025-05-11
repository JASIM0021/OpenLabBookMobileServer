/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose, { ObjectId } from 'mongoose';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { TAdmin } from '../Admin/admin.interface';
import { Admin } from '../Admin/admin.model';
import { IPatient } from '../Patient/patient.interface';
import { PatientModel } from '../Patient/patient.model';
import { TUser } from './user.interface';
import { User } from './user.model';
import { generateAdminId, generateOtp, generatePatientId } from './user.utils';

const createPatientIntoDB = async (contactNumber: string) => {
  // create a user object
  const userData: Partial<TUser> = {};
  //set Patient role
  userData.role = 'patient';
  // set Patient contactNumber
  userData.contactNumber = contactNumber;

  const OTP_EXPIRATION = 15 * 60 * 1000; // 15 minutes in milliseconds
  // Set OTP expiration time
  userData.otpExpiresAt = new Date(Date.now() + OTP_EXPIRATION);
  const generateNewOtp = generateOtp();
  userData.otp = generateNewOtp;
  try {
    //set  generated id
    userData.id = await generatePatientId();
    const newUser = await User.create(userData);

    return newUser;
  } catch (err: any) {
    throw new Error(err);
  }
};

const updatePatientIntoDB = async (id: string, payload: Partial<IPatient>) => {
  const result = await PatientModel.findByIdAndUpdate(id, payload);

  return result;
};

const createAdminIntoDB = async (
  file: any,
  password: string,
  payload: TAdmin,
) => {
  // create a user object
  const userData: Partial<TUser> = {};

  //set student role
  userData.role = 'admin';
  //set admin email
  userData.email = payload.email;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    //set  generated id
    userData.id = await generateAdminId();

    if (file) {
      const imageName = `${userData.id}${payload?.name?.firstName}`;
      const path = file?.path;
      //send image to cloudinary
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      payload.profileImg = secure_url as string;
    }

    // create a user (transaction-1)
    const newUser = await User.create([userData], { session });

    //create a admin
    if (!newUser.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create admin');
    }
    // set id , _id as user
    payload.id = newUser[0].id;
    payload.user = newUser[0]._id as any; //reference _id

    // create a admin (transaction-2)
    const newAdmin = await Admin.create([payload], { session });

    if (!newAdmin.length) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to create admin');
    }

    await session.commitTransaction();
    await session.endSession();

    return newAdmin;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

const getMe = async (userId: string, role: string, user: TUser) => {
  let result = null;

  if (role === 'patient') {
    result = await PatientModel.findOne({ user: user._id }).populate('user');
  }
  if (role === 'admin') {
    result = await Admin.findOne({ id: userId }).populate('user');
  }
  if (role === 'superAdmin') {
    result = await User.findOne({ id: userId });
  }

  return result;
};

const changeStatus = async (id: string, payload: { status: string }) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

export const UserServices = {
  createPatientIntoDB,
  createAdminIntoDB,
  getMe,
  changeStatus,
  updatePatientIntoDB,
};
