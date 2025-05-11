import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { USER_ROLE } from '../User/user.constant';
import { MedicalTestControllers } from './medicaltest.controller';
import { MedicalTesteValidations } from './medicaltest.validation';

const router = express.Router();

router.post(
  '/create-medical-test',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(MedicalTesteValidations.createMedicalTestValidationSchema),
  MedicalTestControllers.createMedicalTest,
);

router.get('/', MedicalTestControllers.getAllMedicalTest);
router.get(
  '/location-medical-test',
  MedicalTestControllers.getAllLocationBaseMedicalTests,
);

router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(MedicalTesteValidations.updateMedicalTestValidationSchema),
  MedicalTestControllers.updateMedicalTest,
);

router.delete(
  '/:id',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  MedicalTestControllers.deleteMedicalTest,
);
export const MedicalTestRoutes = router;
