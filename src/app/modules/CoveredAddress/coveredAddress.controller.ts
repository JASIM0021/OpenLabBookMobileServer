import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CoveredAddressServices } from './coveredAddress.service';




const createCoveredAddress = catchAsync(async (req, res) => {
  const result = await CoveredAddressServices.createAddressFromDB(
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'createCoveredAddress is created successfully',
    data: result,
  });
});

const getSingleAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CoveredAddressServices.getSingleAddressFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'createCoveredAddress is retrieved successfully',
    data: result,
  });
});

const getAllAdmins = catchAsync(async (req, res) => {
  const result = await CoveredAddressServices.getAllAddressFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'createCoveredAddress are retrieved successfully',
    meta: result.meta,
    data: result.result,
  });
});

const updateAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { admin } = req.body;
  const result = await CoveredAddressServices.updateAddressntoDB(id, admin);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'createCoveredAddress is updated successfully',
    data: result,
  });
});

const deleteAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await CoveredAddressServices.deleteAddressFromDB(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'createCoveredAddress is deleted successfully',
    data: result,
  });
});

export const CoveredAddressControllers = {
  getAllAdmins,
  getSingleAdmin,
  deleteAdmin,
  updateAdmin,
  createCoveredAddress
};
