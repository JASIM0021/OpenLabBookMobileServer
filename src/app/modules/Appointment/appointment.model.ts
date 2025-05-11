import mongoose, { Schema } from 'mongoose';
import {
  appointmentPayment,
  appointmentStatus,
  paymentType,
} from './appointment.constant';
import {
  IPatientInfo,
  TAppointment,
  TAppointmentTiming,
} from './appointment.interface';

export const AppointmentTimingSchema: Schema = new Schema<TAppointmentTiming>({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const PatientInfoSchema: Schema<IPatientInfo> = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false },

  contactNumber: { type: String, required: true },
  age: { type: Number, required: true },
  sex: { type: String, required: false },
  referBy: { type: String, required: false },
  pinCode: { type: String, required: false },
  address: { type: String, required: false },
  prescription: { type: [String] },
});

const AppointmentSchema: Schema = new Schema<TAppointment>({
  patientId: {
    type: Schema.Types.ObjectId,
    required: [true, 'Patient id is required'],

    ref: 'Patient',
  },
  organization: {
    type: Schema.Types.ObjectId,
    required: [true, 'Organization id is required'],

    ref: 'Organization',
  },
  appointmentStatus: {
    type: String,
    enum: {
      values: appointmentStatus,
      message: '{VALUE} is not a valid gender',
    },
    default: 'SCHEDULED',
  },
  paymentStatus: {
    type: String,
    enum: {
      values: appointmentPayment,
      message: '{VALUE} is not a valid PaymentStatus',
    },
    required: [true, 'PaymentStatus is required'],
  },
  paymentType: {
    type: String,
    enum: {
      values: paymentType,
      message: '{VALUE} is not a valid paymentType',
    },
    required: [true, 'PaymentStatus is required'],
  },

  bookingType: { type: String, require: true },

  notes: { type: String },
  directAppointment: { type: Boolean, default: false },
  review: { type: String },
  reportPhoto: { type: String },
  prescriptionPhoto: { type: String },
  patientInfo: { type: PatientInfoSchema, required: true },
  medicalTestLists: [
    {
      appointmentTiming: {
        type: [
          {
            day: { type: String, required: true },
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
          },
        ],

        required: true,
      },
      testCode: String,
      testName: String,
      sample: String,
      mrp: Number,
    },
  ],
});

export const Appointment = mongoose.model<TAppointment>(
  'Appointment',
  AppointmentSchema,
);

// MedicalTestSchema.index(
//   { organizationName: 1, testCode: 1, testName: 1 },
//   { unique: true },
// );

// export const MedicalTest = mongoose.model<TMedicalTest>(
//   'MedicalTest',
//   MedicalTestSchema,
// );
