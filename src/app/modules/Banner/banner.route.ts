import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
import { USER_ROLE } from '../User/user.constant';
import { BannerControllers } from './banner.controller';
// import { updateAdminValidationSchema } from './admin.validation';

const router = express.Router();


router.post(
  '/create-banner',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  // validateRequest(MedicalTesteValidations.createMedicalTestValidationSchema),
  BannerControllers.createBanner,
);

router.get(
  '/',
  // auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  BannerControllers.getAllBanners,
);

router.get(
  '/:id',
  // auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  BannerControllers.getSingleBanner,
);

router.patch(
  '/:id',
  auth(USER_ROLE.superAdmin),
  // validateRequest(updateAdminValidationSchema),
  BannerControllers.updateBanner,
);

router.delete(
  '/:adminId',
  auth(USER_ROLE.superAdmin),
  BannerControllers.deleteBanner,
);

export const BannerRoutes = router;
