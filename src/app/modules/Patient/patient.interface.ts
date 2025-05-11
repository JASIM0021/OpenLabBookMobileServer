import { Document, Schema, Types } from 'mongoose';

export type TBloodGroup =
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'AB+'
  | 'AB-'
  | 'O+'
  | 'O-';
export interface IPatient extends Document {
  id: string;
  user: Types.ObjectId;

  age?: number;
  sex?: string;
  pinCode?: string;
  bloodGroup?: TBloodGroup;
  email?: string;
  name?: string;
  profilePhoto?: string;
  contactNumber: string;
  address?: string;
  isDeleted: boolean;
  medicalReport: Schema.Types.ObjectId[]; // Adjust this based on how you manage relationships
  patientHealthData?: Schema.Types.ObjectId; // Adjust this based on how you manage relationships
  appointments: Schema.Types.ObjectId[]; // Adjust this based on how you manage relationships
  prescription: Schema.Types.ObjectId[]; // Adjust this based on how you manage relationships
  review: Schema.Types.ObjectId[]; // Adjust this based on how you manage relationships
}

export type IPatientFilterRequest = {
  searchTerm?: string | undefined;
  email?: string | undefined;
  contactNo?: string | undefined;
};

export type IPatientUpdate = {
  email: string;
  name: string;
  profilePhoto: string;
  contactNumber: string;
  address: string;
  patientHelthData: IPatientHelthData;
  medicalReport: IMedicalReport;
};

export type IMedicalReport = {
  reportName: string;
  reportLink: string;
};
export type IPatientHelthData = {
  dateOfBirth: string | Date;
  gender: 'MALE' | 'FEMALE';
  bloodGroup:
    | 'A_POSITIVE'
    | 'A_NEGATIVE'
    | 'B_POSITIVE'
    | 'B_NEGATIVE'
    | 'O_POSITIVE'
    | 'O_NEGATIVE'
    | 'AB_POSITIVE'
    | 'AB_NEGATIVE';
  hasAllergies: boolean;
  hasDiabetes: boolean;
  height: string;
  weight: string;
  smokingStatus: boolean;
  dietaryPreferences: string;
  pregnancyStatus: boolean;
  mentalHealthHistory: string;
  immunizationStatus: boolean;
  hasPastSurgeries: boolean;
  recentAnxiety: boolean;
  recentDepression: boolean;
  maritalStatus: 'MARRIED' | 'UNMARRIED';
};
