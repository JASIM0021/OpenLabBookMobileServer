/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { TBanner } from './banner.interface';
import { Banner } from './banner.model';

const getAllBannerFromDB = async (query: Record<string, unknown>) => {
  const adminQuery = new QueryBuilder(Banner.find(), query)
    .search(['name'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await adminQuery.modelQuery;
  const meta = await adminQuery.countTotal();
  return {
    result,
    meta,
  };
};

const getSingleBannerFromDB = async (id: string) => {
  const result = await Banner.findById(id);
  return result;
};

const createBannerFromDB = async (file:any,payload: TBanner) => {
  if (file) {
    const imageName = `${payload.name}`;
    const path = file?.path;
    //send image to cloudinary
    const { secure_url } = await sendImageToCloudinary(imageName, path);
    payload.photoUrl = secure_url as string;
  }
  const result = await Banner.create(payload);
  return result;
};

const updateBannerntoDB = async (id: string, payload: Partial<TBanner>) => {
  const { name, ...remainingAdminData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingAdminData,
  };

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdatedData[`name.${key}`] = value;
    }
  }

  const result = await Banner.findByIdAndUpdate({ id }, modifiedUpdatedData, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteBannerFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deletedAdmin = await Banner.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session },
    );

    if (!deletedAdmin) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete student');
    }

   

    await session.commitTransaction();
    await session.endSession();

    return deletedAdmin;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};

export const BannerServices = {
  getAllBannerFromDB,
  getSingleBannerFromDB,
  updateBannerntoDB,
  deleteBannerFromDB,
  createBannerFromDB
};
