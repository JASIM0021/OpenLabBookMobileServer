/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { TCoveredAddress } from './coveredAddress.interface';
import { CoveredAddress } from './coveredAddress.model';

const getAllAddressFromDB = async (query: Record<string, unknown>) => {
  const adminQuery = new QueryBuilder(CoveredAddress.find(), query)
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

const getSingleAddressFromDB = async (id: string) => {
  const result = await CoveredAddress.findById(id);
  return result;
};

const createAddressFromDB = async (payload: TCoveredAddress) => {
  const result = await CoveredAddress.create(payload);
  return result;
};

const updateAddressntoDB = async (id: string, payload: Partial<TCoveredAddress>) => {
  const { name, ...remainingAdminData } = payload;

  const modifiedUpdatedData: Record<string, unknown> = {
    ...remainingAdminData,
  };

  if (name && Object.keys(name).length) {
    for (const [key, value] of Object.entries(name)) {
      modifiedUpdatedData[`name.${key}`] = value;
    }
  }

  const result = await CoveredAddress.findByIdAndUpdate({ id }, modifiedUpdatedData, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteAddressFromDB = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deletedAdmin = await CoveredAddress.findByIdAndUpdate(
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

export const CoveredAddressServices = {
  getAllAddressFromDB,
  getSingleAddressFromDB,
  updateAddressntoDB,
  deleteAddressFromDB,
  createAddressFromDB
};
