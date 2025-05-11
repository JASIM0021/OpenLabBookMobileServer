import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { MedicalTestServices } from './medicaltest.service';

const createMedicalTest = catchAsync(async (req, res) => {
  const result = await MedicalTestServices.createMedicalTestIntoDB(
    req.file,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MedicalTest is created successfully',
    data: result,
  });
});

const getAllMedicalTest = catchAsync(async (req, res) => {
  const result = await MedicalTestServices.getAllCoMedicalTestsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Medical Test are retrieved successfully',
    // meta: result.meta,
    data: result.result,
  });
});

const getAllLocationBaseMedicalTests = catchAsync(async (req, res) => {
  const result = await MedicalTestServices.getAllLocationBaseMedicalTestsFromDB(
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Medical Test are retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const getSingleCourse = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MedicalTestServices.getSingleMedicalTestFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Course is retrieved successfully',
    data: result,
  });
});

const updateMedicalTest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MedicalTestServices.updateSingleMedicalTestIntoDB(
    id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MedicalTest is updated successfully',
    data: result,
  });
});

const deleteMedicalTest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await MedicalTestServices.deleteMedicalTestFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'MedicalTest is deleted successfully',
    data: result,
  });
});

export const MedicalTestControllers = {
  createMedicalTest,
  getSingleCourse,
  getAllMedicalTest,
  updateMedicalTest,
  deleteMedicalTest,
  getAllLocationBaseMedicalTests,
};
