import { Router } from 'express';
import { AdminRoutes } from '../modules/Admin/admin.route';
import { AppointmentRoutes } from '../modules/Appointment/appointment.route';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { BannerRoutes } from '../modules/Banner/banner.route';
import { CoveredAddressRoutes } from '../modules/CoveredAddress/coveredAddress.route';
import { MedicalTestRoutes } from '../modules/MedicalTest/medicaltest.route';
import { OrganizationRoutes } from '../modules/Organization/organization.route';
import { PatientRoutes } from '../modules/Patient/patient.route';
import { ServicesRoutes } from '../modules/Service/service.route';
import { UserRoutes } from '../modules/User/user.route';
import { CartRouter } from '../modules/cart/cart.rout';
const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/medical-tests',
    route: MedicalTestRoutes,
  },
  {
    path: '/organizations',
    route: OrganizationRoutes,
  },
  {
    path: '/appointments',
    route: AppointmentRoutes,
  },
  {
    path: '/patients',
    route: PatientRoutes,
  },
  {
    path: '/admins',
    route: AdminRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/covered-address',
    route: CoveredAddressRoutes,
  },
  {
    path: '/services',
    route: ServicesRoutes,
  },
  {
    path: '/banners',
    route: BannerRoutes,
  },
  {
    path: '/cart',
    route: CartRouter,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
