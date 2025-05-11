/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { Organization } from '../Organization/organization.model';
import { Service } from '../Service/service.model';
import { MedicalTestSearchableFields } from './medicaltest.constant';
import { TMedicalTest } from './medicaltest.interface';
import { MedicalTest } from './medicaltest.model';

const createMedicalTestIntoDB = async (file: any, payload: TMedicalTest) => {
  const organizationInfo = await Organization.findOne({
    organizationCode: payload.organizationCode,
  });
  console.log('organizationInfo', organizationInfo);
  console.log('payload.organizationCode', payload?.organizationCode);
  if (!organizationInfo?.organizationName) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Organization Not Found!');
  }
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    //set  generated id

    if (file) {
      const imageName = `${payload.testName}_${payload?.organizationName}`;
      const path = file?.path;
      //send image to cloudinary
      const { secure_url } = await sendImageToCloudinary(imageName, path);
      payload.medicalTestBanner = secure_url as string;
    }

    payload.organizationName = organizationInfo?.organizationName;
    payload.organizationContactNumber =
      organizationInfo?.organizationContactNumber;
    payload.organizationPhoto = organizationInfo?.organizationPhoto;
    payload.organizationTiming = organizationInfo?.organizationTiming;
    payload.organizationAddress = organizationInfo?.organizationAddress;
    payload.organization = organizationInfo?._id;

    // create a user (transaction-1)
    const newMedicalTest = await MedicalTest.create([payload], { session });

    //create a admin
    if (!newMedicalTest.length) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to create MedicalTest',
      );
    }
    // set id , _id as user
    payload.id = newMedicalTest[0].id;

    // create a admin (transaction-2)
    const updatedOrganization = await Organization.findOneAndUpdate(
      { organizationCode: payload.organizationCode },
      {
        $addToSet: { medicalTests: newMedicalTest[0]._id },
      },
      {
        new: true,
        session,
      },
    );

    if (!updatedOrganization) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Failed to updated Organization',
      );
    }

    async function updateServices() {
      const updates = payload.services.map(update => {
        return Service.findOneAndUpdate(
          { serviceName: update.serviceName }, // find by service name
          {
            $addToSet: { medicalTests: newMedicalTest[0]._id },
          },
          {
            new: true,
            session,
          },
        );
      });

      try {
        await Promise.all(updates);
      } catch (error) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          'Failed to updated Organization',
        );
      }
    }

    await updateServices();

    await session.commitTransaction();
    await session.endSession();

    return { updatedOrganization, newMedicalTest };
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};
const getAllCoMedicalTestsFromDB = async (query: Record<string, unknown>) => {
  const skip = ((query?.page as number) - 1) * (query?.limit as number);

  let searchCriteria: Record<string, any> = {
    isDeleted: false, // Ensure deleted tests are excluded by default
  };
  console.log('query?.searchTerm', query?.searchTerm);
  // **Filter based on service name**
  if (query?.service && typeof query.service === 'string') {
    searchCriteria['services.serviceName'] = query.service;
  }

  // **If a search term exists, apply prioritization**
  if (query?.searchTerm && typeof query.searchTerm === 'string') {
    console.log('inside searchTerm', query.searchTerm.trim());
    const searchTerm = query.searchTerm.trim();
    // const searchRegex = { $regex: `%${searchTerm}%`, $options: 'i' };
    // const searchRegex = { $regex: searchTerm, $options: 'i' };
    const searchRegex = {
      $regex: `${searchTerm}.*`,
      $options: 'i',
    };
    // const searchRegex = { $regex: `${searchTerm}.*`, $options: 'i' };
    console.log('searchRegex', searchRegex);
    searchCriteria['$or'] = [
      { testName: searchRegex }, // Priority 1: testName
      { testCode: searchRegex }, // Priority 2: testCode
      { organizationName: searchRegex }, // Priority 3: organizationName
    ];
  }

  // **Fetch tests from DB with pagination**
  const tests = await MedicalTest.find(searchCriteria)
    .skip(skip) // Apply pagination skip
    .limit((query?.limit as number) || 10); // Limit the number of results

  // **Count total number of matching documents**
  const total = await MedicalTest.countDocuments(searchCriteria).exec();

  return {
    meta: {
      total,
      page: query?.page || 1,
      limit: query?.limit || 10,
    },
    result: tests,
  };
};

const getAllLocationBaseMedicalTestsFromDB = async (
  query: Record<string, unknown>,
) => {
  const regex = new RegExp(query.locationCover as string, 'i'); // 'i' for case-insensitive matching

  const findAllServiceLocationName = await Service.find(
    {
      // serviceCoverAreaAddress : {
      //   $elemMatch: { locationCity: regex }
      // }
    },
    {
      // serviceName:true
    },
  );
  console.log('findAllServiceLocationName', findAllServiceLocationName);
  const allNamesss = findAllServiceLocationName.map(it => it.serviceName);
  console.log('allNamesss', allNamesss);

  const courseQuery = new QueryBuilder(
    MedicalTest.find({
      services: {
        $elemMatch: {
          serviceName: {
            $in: allNamesss,
          },
        },
      },
    }),
    query,
  )

    .search(MedicalTestSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await courseQuery.modelQuery;
  const meta = await courseQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleMedicalTestFromDB = async (id: string) => {
  const result = await MedicalTest.findById(id);
  return result;
};

const updateSingleMedicalTestIntoDB = async (
  id: string,
  payload: Partial<TMedicalTest>,
) => {
  const { organizationTiming, ...courseRemainingData } = payload;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    //step1: basic course info update
    const updatedBasicCourseInfo = await MedicalTest.findByIdAndUpdate(
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
        'Failed to update MedicalTest',
      );
    }

    // check if there is any pre requisite courses to update
    if (organizationTiming && organizationTiming.length > 0) {
      // filter out the deleted fields
      const deletedPreRequisites = organizationTiming.filter(
        el => el.isDeleted,
      );

      const deletedPreRequisiteCourses = await MedicalTest.findByIdAndUpdate(
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
        throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
      }

      // filter out the new course fields
      const newPreRequisites = organizationTiming?.filter(el => !el.isDeleted);

      const newPreRequisiteCourses = await MedicalTest.findByIdAndUpdate(
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

    const result = await MedicalTest.findById(id);

    return result;
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to update course');
  }
};

const deleteMedicalTestFromDB = async (id: string) => {
  const result = await MedicalTest.findByIdAndUpdate(
    id,
    { isDeleted: true },
    {
      new: true,
    },
  );
  return result;
};

export const MedicalTestServices = {
  createMedicalTestIntoDB,
  getAllCoMedicalTestsFromDB,
  getSingleMedicalTestFromDB,
  updateSingleMedicalTestIntoDB,
  deleteMedicalTestFromDB,
  getAllLocationBaseMedicalTestsFromDB,
};
