import { TBloodGroup } from './patient.interface';

export const patientSearchableFields: string[] = ['name', 'email', 'contactNo'];

export const patientFilterableFields: string[] = [
  'searchTerm',
  'email',
  'contactNo',
];

export const BloodGroup: TBloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];
