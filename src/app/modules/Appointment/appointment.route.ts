import express, { NextFunction, Request, Response } from 'express';

import auth from '../../middlewares/auth';

import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { USER_ROLE } from '../User/user.constant';
import { AppointmentController } from './appointment.controller';
import { AppointmentValidation } from './appointment.validation';

const router = express.Router();

// router.get(
//   '/',
//   auth(USER_ROLE.superAdmin, USER_ROLE.admin),
//   AppointmentController.getAllFromDB,
// );

// router.get(
//   '/my-appointments',
//   auth(USER_ROLE.PATIENT, USER_ROLE.DOCTOR),
//   AppointmentController.getMyAppointment,
// );

router.post(
  '/',
  auth(USER_ROLE.patient),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(AppointmentValidation.createAppointment),
  AppointmentController.createAppointment,
);

router.post(
  '/create-direct-appointment',
  auth(USER_ROLE.patient),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  // validateRequest(AppointmentValidation.createAppointment),
  AppointmentController.createDirectAppointment,
);

router.post(
  '/create-from-cart',
  auth(USER_ROLE.patient),
  // upload.single('file'),
  // (req: Request, res: Response, next: NextFunction) => {
  //   req.body = JSON.parse(req.body.data);
  //   next();
  // },
  // validateRequest(AppointmentValidation.createAppointment),
  AppointmentController.createFromCart,
);

router.get(
  '/my-appointments',
  auth(USER_ROLE.patient),
  AppointmentController.getMyAppointment,
);

router.patch(
  '/status/:appointmentId',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.patient),
  AppointmentController.changeAppointmentStatus,
);

router.get(
  '/cancel/:appointmentId',
  auth(USER_ROLE.admin, USER_ROLE.superAdmin, USER_ROLE.patient),
  AppointmentController.cancelAppointment,
);

export const AppointmentRoutes = router;
