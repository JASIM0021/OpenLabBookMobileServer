/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { generateOrganizationCode } from '../User/user.utils';
import { OrganizationSearchableFields } from './organization.constant';
import { TOrganization } from './organization.interface';
import { Organization } from './organization.model';

const createOrganizationIntoDB = async (file: any, payload: TOrganization) => {
  try {
    console.log('payload', payload);
    payload.organizationCode = await generateOrganizationCode();

    if (file) {
      const imageName = `${payload.organizationName}`;
      const path = file?.path;
      //send image to cloudinary
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      payload.organizationPhoto = secure_url as string;
    }
    // create a user (transaction-1)
    const newOrganization = await Organization.create(payload);

    return newOrganization;
  } catch (err: any) {
    throw new Error(err);
  }
};

const getAllOrganizationsFromDB = async (query: Record<string, unknown>) => {
  const OrganizationQuery = new QueryBuilder(Organization.find(), query)
    .search(OrganizationSearchableFields)
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

const getSingleOrganizationFromDB = async (id: string) => {
  const result = await Organization.findById(id).populate('medicalTests');

  return result;
};

const updateOrganizationIntoDB = async (
  file: any,
  id: string,
  payload: Partial<TOrganization>,
) => {
  const { organizationTiming, organizationCode, ...courseRemainingData } =
    payload;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (file) {
      const imageName = `${payload?.organizationName}`;
      const path = file?.path;
      //send image to cloudinary
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      courseRemainingData.organizationPhoto = secure_url as string;
    }

    //step1: basic course info update
    const updatedBasicCourseInfo = await Organization.findByIdAndUpdate(
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

    // check if there is any pre requisite courses to update
    if (organizationTiming && organizationTiming.length > 0) {
      // filter out the deleted fields
      const deletedPreRequisites = organizationTiming.filter(
        el => el.isDeleted,
      );

      const deletedPreRequisiteCourses = await Organization.findByIdAndUpdate(
        id,
        {
          $pull: {
            organizationTiming: { course: { $in: deletedPreRequisites } },
          },
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!deletedPreRequisiteCourses) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Failed to update Organization',
        );
      }

      // filter out the new course fields
      const newPreRequisites = organizationTiming?.filter(el => !el.isDeleted);

      const newPreRequisiteCourses = await Organization.findByIdAndUpdate(
        id,
        {
          $addToSet: { organizationTiming: { $each: newPreRequisites } },
        },
        {
          new: true,
          runValidators: true,
          session,
        },
      );

      if (!newPreRequisiteCourses) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
      }
    }

    await session.commitTransaction();
    await session.endSession();

    const result = await Organization.findById(id);

    return result;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update Organization');
  }
};

const deleteOrganizationFromDB = async (id: string) => {
  const result = await Organization.findByIdAndUpdate(
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
  const result = await Organization.findByIdAndUpdate(
    id,
    { isAvailability },
    {
      new: true,
    },
  );
  return result;
};

export const OrganizationServices = {
  createOrganizationIntoDB,
  getAllOrganizationsFromDB,
  getSingleOrganizationFromDB,
  updateOrganizationIntoDB,
  deleteOrganizationFromDB,
  availabilityStatusOrganizationFromDB,
};
