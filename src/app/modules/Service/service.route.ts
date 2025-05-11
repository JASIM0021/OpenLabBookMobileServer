import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { upload } from '../../utils/sendImageToCloudinary';
import { USER_ROLE } from '../User/user.constant';
import { ServiceControllers } from './service.controller';

const router = express.Router();

router.post(
  '/create-service',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  // validateRequest(OrganizationValidation.createOrganizationValidationSchema),
  ServiceControllers.createService,
);

router.get('/', ServiceControllers.getAllService);
router.get('/:organizationId', ServiceControllers.getSingleService);

router.patch(
  '/:organizationId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  upload.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  // validateRequest(
  //   OrganizationValidation.updateOrganizationValidationSchema,
  // ),
  ServiceControllers.updateService,
);


router.patch(
  'status/:organizationId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  // validateRequest(
  //   OrganizationValidation.organizationAvailibityStatusSchema,
  // ),
  ServiceControllers.availabilityStatusOrganization,
);


router.delete(
  '/:organizationId',
  auth(USER_ROLE.superAdmin, USER_ROLE.admin),
  // validateRequest(
  //   OrganizationValidation.updateOrganizationValidationSchema,
  // ),
  ServiceControllers.deleteService,
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

export const ServicesRoutes = router;
