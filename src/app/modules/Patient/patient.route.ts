import express, { NextFunction, Request, Response } from 'express';

import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { USER_ROLE } from '../User/user.constant';
import { PatientController } from './patient.controller';
import { patientValidations } from './patient.validation';

const router = express.Router();

router.get(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  PatientController.getByIdFromDB,
);

router.post(
  '/:id',

  auth(USER_ROLE.superAdmin, USER_ROLE.admin, USER_ROLE.patient),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(patientValidations.updatePatientValidationSchema),

  PatientController.updateIntoDB,
);

router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  PatientController.deleteFromDB,
);
router.delete(
  '/soft/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  PatientController.softDelete,
);

export const PatientRoutes = router;
