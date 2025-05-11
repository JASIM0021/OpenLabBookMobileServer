import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { USER_ROLE } from '../User/user.constant';
import { OrganizationControllers } from './organization.controller';
import { OrganizationValidation } from './organization.validation';

const router = express.Router();

router.post(
  '/create-organization',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(OrganizationValidation.createOrganizationValidationSchema),
  OrganizationControllers.createOrganization,
);

router.get('/', OrganizationControllers.getAllOrganization);
router.get('/:organizationId', OrganizationControllers.getSingleOrganization);

router.patch(
  '/:organizationId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(OrganizationValidation.updateOrganizationValidationSchema),
  OrganizationControllers.updateOrganization,
);

router.patch(
  'status/:organizationId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(OrganizationValidation.organizationAvailibityStatusSchema),
  OrganizationControllers.availabilityStatusOrganization,
);

router.delete(
  '/:organizationId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  validateRequest(OrganizationValidation.updateOrganizationValidationSchema),
  OrganizationControllers.deleteOrganization,
);

// router.get(
//   '/',
//   auth(
//     USER_ROLE.superAdmin,
//     USER_ROLE.admin,
//     USER_ROLE.faculty,
//     USER_ROLE.student,
//   ),
//   AcademicDepartmentControllers.getAllAcademicDepartments,
// );

export const OrganizationRoutes = router;
