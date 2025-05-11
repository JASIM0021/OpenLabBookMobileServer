/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import httpStatus from 'http-status';
import mongoose, { ClientSession } from 'mongoose';

import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { User } from '../User/user.model';
import { IPatient } from './patient.interface';
import { PatientModel } from './patient.model';
import { TUser } from '../User/user.interface';

// const getAllFromDB = async (
//   filters: IPatientFilterRequest,
//   options: IPaginationOptions,
// ): Promise<IGenericResponse<IPatient[]>> => {
//   const { limit, page, skip } = paginationHelpers.calculatePagination(options);
//   const { searchTerm, ...filterData } = filters;

//   const andConditions = [];

//   if (searchTerm) {
//     andConditions.push({
//       OR: patientSearchableFields.map((field) => ({
//         [field]: {
//           contains: searchTerm,
//           mode: 'insensitive',
//         },
//       })),
//     });
//   }

//   if (Object.keys(filterData).length > 0) {
//     andConditions.push({
//       AND: Object.keys(filterData).map((key) => {
//         return {
//           [key]: {
//             equals: (filterData as any)[key],
//           },
//         };
//       }),
//     });
//   }
//   andConditions.push({
//     isDeleted: false,
//   });

//   const whereConditions: Prisma.PatientWhereInput =
//     andConditions.length > 0 ? { AND: andConditions } : {};

//   const result = await prisma.patient.findMany({
//     include: {
//       medicalReport: true,
//       patientHelthData: true,
//     },
//     where: whereConditions,
//     skip,
//     take: limit,
//     orderBy:
//       options.sortBy && options.sortOrder
//         ? { [options.sortBy]: options.sortOrder }
//         : {
//             createdAt: 'desc',
//           },
//   });
//   const total = await prisma.patient.count({
//     where: whereConditions,
//   });

//   return {
//     meta: {
//       total,
//       page,
//       limit,
//     },
//     data: result,
//   };
// };

const getByIdFromDB = async (
  id: string,
  user: TUser,
): Promise<IPatient | null> => {
  const patient = await PatientModel.findOne({ user: user?._id });
  return patient;
};
// const updatePatientIntoDB = async (
//   id: string,
//   payload: Partial<IPatient>,
//   file: any,
//   userInfo: any,
// ) => {
//   const session: ClientSession = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     if (file) {
//       const imageName = `patientImg${id}`;
//       const path = file?.path;
//       // Send image to cloudinary
//       const { secure_url } = await sendImageToCloudinary(imageName, path);
//       payload.profilePhoto = secure_url as string;
//     }

//     const patient = await PatientModel.findOne({ user: userInfo?._id });

//     console.log('patient', patient);
//     if (!patient) {
//       throw new AppError(
//         httpStatus.BAD_REQUEST,
//         'Failed to Get Patient Information',
//       );
//     }

//     let updatedUser = userInfo;

//     if (!userInfo.isProfileSetup && (patient?.name || payload?.name)) {
//       updatedUser = await User.findByIdAndUpdate(
//         patient?.user,
//         { isProfileSetup: true },
//         {
//           new: true,
//           session,
//         },
//       );
//       if (!updatedUser) {
//         throw new AppError(
//           httpStatus.BAD_REQUEST,
//           'Failed to Get Patient Information',
//         );
//       }
//     }

//     const result = await PatientModel.findByIdAndUpdate(id, payload, {
//       new: true,
//       session,
//     });

//     await session.commitTransaction();
//     session.endSession();

//     return { user: updatedUser, patient: result };
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };

const updatePatientIntoDB = async (
  id: string,
  payload: Partial<IPatient>,
  file: any,
  userInfo: any,
) => {
  if (file) {
    const imageName = `patientImg${id}`;
    const path = file?.path;
    // Send image to cloudinary
    const { secure_url } = await sendImageToCloudinary(imageName, path);
    payload.profilePhoto = secure_url as string;
  }
  const patient = await PatientModel.findOne({ user: userInfo?._id });

  console.log('patient', patient);
  if (patient) {
    const updatedPatient = await PatientModel.findByIdAndUpdate(
      patient._id,
      payload,
      {
        new: true,
      },
    );
    console.log('updatedPatient', updatedPatient);
    const updatedUser = await User.findByIdAndUpdate(
      userInfo?._id,
      { isProfileSetup: true },
      {
        new: true,
      },
    );

    return { user: updatedUser, patient: updatedPatient };
  } else {
  }
};
const deleteFromDB = async (id: string) => {
  // return await prisma.$transaction(async (transactionClient) => {
  //   await transactionClient.patientHelthData.delete({
  //     where: {
  //       patientId: id,
  //     },
  //   });
  //   await transactionClient.medicalReport.deleteMany({
  //     where: {
  //       patientId: id,
  //     },
  //   });
  //   const deletedPatient = await transactionClient.patient.delete({
  //     where: {
  //       id,
  //     },
  //   });
  //   await transactionClient.user.delete({
  //     where: {
  //       email: deletedPatient.email,
  //     },
  //   });
  //   return deletedPatient;
  // });
};

const softDelete = async (id: string) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const deletedFaculty = await PatientModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true, session },
    );

    if (!deletedFaculty) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete faculty');
    }

    // get user _id from deletedFaculty
    const userId = deletedFaculty.user;

    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true, session },
    );

    if (!deletedUser) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete user');
    }

    await session.commitTransaction();
    await session.endSession();

    return deletedFaculty;
  } catch (err: any) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error(err);
  }
};
export const PatientService = {
  // getAllFromDB,
  getByIdFromDB,
  updatePatientIntoDB,
  deleteFromDB,
  softDelete,
};
