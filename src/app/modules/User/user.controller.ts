import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';
import { TUser } from './user.interface';

const createPatient = catchAsync(async (req, res) => {
  const { contactNumber } = req.body;

  const result = await UserServices.createPatientIntoDB(contactNumber);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Patient is created successfully',
    data: result,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const { password, admin: adminData } = req.body;

  const result = await UserServices.createAdminIntoDB(
    req.file,
    password,
    adminData,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Admin is created successfully',
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {
  const { userId, role } = req.user;
  const userInfo = req.userInfo as TUser;
  const result = await UserServices.getMe(userId, role, userInfo);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is retrieved successfully',
    data: { user: req?.userInfo, profileInfo: result },
  });
});

const changeStatus = catchAsync(async (req, res) => {
  const id = req.params.id;

  const result = await UserServices.changeStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Status is updated successfully',
    data: result,
  });
});
export const UserControllers = {
  createAdmin,
  getMe,
  changeStatus,
  createPatient,
};
