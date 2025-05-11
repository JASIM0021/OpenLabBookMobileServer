import { Document, Types } from 'mongoose';

export interface TOrganizationTiming {
  day: string;
  startTime: string;
  endTime: string;
  isAvailability: boolean;
  isDeleted: boolean;
}

export interface TMedicalTest extends Document {
  testCode: string;
  testName: string;
  sample: string;
  mrp: number;
  discountedPrice: number;
  // original_mrp: number;
  medicalTestBanner?: string;
  organizationCode: string;

  organizationName: string;
  organizationContactNumber: string;
  organizationPhoto?: string;
  organizationTiming: TOrganizationTiming[];
  organizationAddress: string;
  isAvailability: boolean;
  isDeleted: boolean;
  isHomeServiceAvailable: boolean;
  organization: Types.ObjectId;
  services: {
    serviceName: string;
    serviceRef: Types.ObjectId;
  }[];
  coverAddress: string[];
}
