import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { TUser } from '../User/user.interface';
import { AppointmentServices } from './appointment.service';

const createAppointment = catchAsync(async (req: Request, res: Response) => {
  const userInfo = req.userInfo as TUser;

  const result = await AppointmentServices.createAppointment(
    req.file,
    req.body,
    userInfo,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Appointment booked successfully!',
    data: result,
  });
});

const createDirectAppointment = catchAsync(
  async (req: Request, res: Response) => {
    const userInfo = req.userInfo as TUser;

    const result = await AppointmentServices.createDirectAppointment(
      req.file,
      req.body,
      userInfo,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Appointment Direct booked successfully!',
      data: result,
    });
  },
);

const getMyAppointment = catchAsync(async (req: Request, res: Response) => {
  const user = req.userInfo;
  console.log('req.query', req.query);
  const result = await AppointmentServices.getMyAppointment(req.query, user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Appointment retrieval successfully',
    meta: result.meta,
    data: result.result,
  });
});

const cancelAppointment = catchAsync(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const userInfo = req.userInfo;

  const result = await AppointmentServices.cancelAppointment(
    appointmentId,
    userInfo,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Appointment cancel successfully',
    data: result,
  });
});

// const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
//     const filters = pick(req.query, appointmentFilterableFields)
//     const options = pick(req.query, ['limit', 'page', 'sortBy', 'sortOrder']);
//     const result = await AppointmentServices.getAllFromDB(filters, options);
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: 'Appointment retrieval successfully',
//         meta: result.meta,
//         data: result.data,
//     });
// });

const changeAppointmentStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { appointmentId } = req.params;
    const userInfo = req.userInfo;
    const result = await AppointmentServices.changeAppointmentStatus(
      appointmentId,
      req.body.appointmentStatus,
      userInfo,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Appointment status changed successfully',
      data: result,
    });
  },
);

const createFromCart = catchAsync(async (req: Request, res: Response) => {
  const userInfo = req.userInfo as TUser;
  const result = await AppointmentServices.createAppionmentFromCart(
    req.body,
    userInfo,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Appointment  booked successfully!',
    data: result,
  });
});

export const AppointmentController = {
  createAppointment,
  getMyAppointment,
  cancelAppointment,
  changeAppointmentStatus,
  // getAllFromDB,
  // changeAppointmentStatus,
  createDirectAppointment,
  createFromCart,
};
