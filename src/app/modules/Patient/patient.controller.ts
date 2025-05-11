import { Request, Response } from 'express';
import httpStatus from 'http-status';

import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

import { PatientService } from './patient.service';
import { TUser } from '../User/user.interface';

// const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
// const filters = pick(req.query, patientFilterableFields);
// const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
// const result = await PatientService.getAllFromDB(filters, options);
// sendResponse(res, {
//   statusCode: httpStatus.OK,
//   success: true,
//   message: 'Patient retrieval successfully',
//   meta: result.meta,
//   data: result.data,
// });
// });

const getByIdFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userInfo = req.userInfo as TUser;
  const result = await PatientService.getByIdFromDB(id, userInfo);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient retrieval successfully',
    data: result,
  });
});

const updateIntoDB = catchAsync(async (req: Request, res: Response) => {
  const userInfo = req.userInfo as TUser;
  const { id } = req.params;

  // console.log('req.body', req.body);
  // console.log('id', id);
  // console.log('userInfo', userInfo);
  const result = await PatientService.updatePatientIntoDB(
    id,
    req.body,
    req.file,
    userInfo,
  );
  console.log('result', result);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient updated successfully',
    data: result,
  });
});

const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.deleteFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient deleted successfully',
    data: result,
  });
});
const softDelete = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PatientService.softDelete(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient soft deleted successfully',
    data: result,
  });
});

export const PatientController = {
  // getAllFromDB,
  getByIdFromDB,
  updateIntoDB,
  deleteFromDB,
  softDelete,
};
