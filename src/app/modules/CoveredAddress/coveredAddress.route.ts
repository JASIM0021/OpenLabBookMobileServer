import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { CoveredAddressControllers } from './coveredAddress.controller';
// import { updateAdminValidationSchema } from './admin.validation';

const router = express.Router();


router.post(
  '/create-covered-address',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  // upload.single('file'),
  // (req: Request, res: Response, next: NextFunction) => {
  //   req.body = JSON.parse(req.body.data);
  //   next();
  // },
  // validateRequest(MedicalTesteValidations.createMedicalTestValidationSchema),
  CoveredAddressControllers.createCoveredAddress,
);

router.get(
  '/',
  // auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  CoveredAddressControllers.getAllAdmins,
);

router.get(
  '/:id',
  // auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  CoveredAddressControllers.getSingleAdmin,
);

router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin),
  // validateRequest(updateAdminValidationSchema),
  CoveredAddressControllers.updateAdmin,
);

router.delete(
  '/:adminId',
  auth(USER_ROLE.superAdmin),
  CoveredAddressControllers.deleteAdmin,
);

export const CoveredAddressRoutes = router;
