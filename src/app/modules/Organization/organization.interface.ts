import { Types } from 'mongoose';
export interface TOrganizationTiming {
  day: string;
  startTime: string;
  endTime: string;
  isDeleted:boolean
  isAvailability:boolean;

}

export type TOrganization = {
  organizationCode: string;
  medicalTests: [Types.ObjectId];
  organizationName: string;
  organizationContactNumber: string;
  organizationPhoto?: string;
  organizationTiming: TOrganizationTiming[];
  organizationAddress: string;
  isDeleted:boolean;
  isAvailability:boolean;
  coverAddress:string[]

};
