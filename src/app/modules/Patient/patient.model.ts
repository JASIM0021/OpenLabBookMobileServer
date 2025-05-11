import { Schema, model } from 'mongoose';
import { IPatient } from './patient.interface';

const patientSchema = new Schema<IPatient>(
  {
    id: {
      type: String,
      required: [true, 'ID is required'],
      unique: true,
    },
    email: {
      type: String,
      default: '',
    },
    contactNumber: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: '',
    },
    profilePhoto: {
      type: String,
      default: null,
    },

    age: {
      type: String,
      default: null,
    },
    sex: {
      type: String,
      default: null,
    },

    pinCode: {
      type: String,
      default: null,
    },
    bloodGroup: {
      type: String,
      default: null,
    },

    address: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    medicalReport: [
      {
        type: Schema.Types.ObjectId,
        ref: 'MedicalReport',
      },
    ],
    patientHealthData: {
      type: Schema.Types.ObjectId,
      ref: 'PatientHealthData',
      default: null,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
      },
    ],
    prescription: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Prescription',
      },
    ],
    review: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  },
);

// Create and export the Patient model
export const PatientModel = model<IPatient>('Patient', patientSchema);
