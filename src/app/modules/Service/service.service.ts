/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { TService } from './service.interface';
import { Service } from './service.model';

const createServiceIntoDB = async (file: any, payload: TService) => {
  try {
    if (file) {
      const imageName = `${payload.serviceName}`;
      const path = file?.path;
      //send image to cloudinary
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      payload.servicePhoto = secure_url as string;
    }
    // create a user (transaction-1)

    console.log('payload', payload);
    const newOrganization = await Service.create(payload);

    return newOrganization;
  } catch (err: any) {
    throw new Error(err);
  }
};

const getAllServicesFromDB = async (query: Record<string, unknown>) => {
  const OrganizationQuery = new QueryBuilder(
    Service.find(),
    // .populate('serviceCoverAreaAddress.addressRef')
    query,
  )
    .search(['serviceName'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await OrganizationQuery.modelQuery;
  const meta = await OrganizationQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleServiceFromDB = async (id: string) => {
  const result = await Service.findById(id).populate('medicalTests');

  return result;
};

const updateServiceIntoDB = async (
  file: any,
  id: string,
  payload: Partial<TService>,
) => {
  const { ...courseRemainingData } = payload;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (file) {
      const imageName = `${payload?.serviceName}`;
      const path = file?.path;
      //send image to cloudinary
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      courseRemainingData.servicePhoto = secure_url as string;
    }

    //step1: basic course info update
    const updatedBasicCourseInfo = await Service.findByIdAndUpdate(
      id,
      courseRemainingData,
      {
        new: true,
        runValidators: true,
        session,
      },
    );

    if (!updatedBasicCourseInfo) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to update Organization',
      );
    }

    await session.commitTransaction();
    await session.endSession();

    const result = await Service.findById(id);

    return result;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Organization');
  }
};

const deleteServiceFromDB = async (id: string) => {
  const result = await Service.findByIdAndUpdate(
    id,
    { isDeleted: true },
    {
      new: true,
    },
  );
  return result;
};

const availabilityStatusOrganizationFromDB = async (
  id: string,
  isAvailability: true | false,
) => {
  const result = await Service.findByIdAndUpdate(
    id,
    { isAvailability },
    {
      new: true,
    },
  );
  return result;
};

export const ServiceServices = {
  createServiceIntoDB,
  getAllServicesFromDB,
  getSingleServiceFromDB,
  updateServiceIntoDB,
  deleteServiceFromDB,
  availabilityStatusOrganizationFromDB,
};
