import { Document, Types } from 'mongoose';
import { TAppointmentStatus } from './appointment.constant';

export interface TAppointmentTiming {
  day: string;
  startTime: string;
  endTime: string;
}

export interface IPatientInfo {
  name: string;
  email: string;
  contactNumber: string;
  age: number;
  sex: 'MALE' | 'FEMALE' | 'OTHER';
  referBy?: string;
  pinCode: string;
  address: string;
  prescription?: string[];
}

export interface TAppointment extends Document {
  patientId: Types.ObjectId;
  organization: Types.ObjectId;
  appointmentStatus: TAppointmentStatus;
  paymentStatus: string;
  paymentType: string;
  bookingType: string;
  notes?: string;
  review?: string;
  reportPhoto?: string;
  serviceName: string;
  prescriptionPhoto?: string;

  patientInfo: IPatientInfo;
  directAppointment: boolean;
  medicalTestLists: [
    {
      appointmentTiming: TAppointmentTiming;
      testCode: string;
      testName: string;
      sample: string;
      mrp: number;
    },
  ];
}
