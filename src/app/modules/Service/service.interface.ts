import { Types } from 'mongoose';

export type TService = {
  medicalTests: [Types.ObjectId];
  serviceName: string;
  description: string;
  serviceContactNumber?: string;
  servicePhoto?: string;
  navigationScreen: string;
  // serviceCoverAreaAddress: [Types.ObjectId];
  isDeleted: boolean;
  isAvailability: boolean;
  serviceCoverAreaAddress: string[];
};
