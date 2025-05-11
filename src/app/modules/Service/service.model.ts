import { Schema, model } from 'mongoose';
import { TService } from './service.interface';

const ServiceSchema = new Schema<TService>(
  {
    serviceName: { type: String, required: true, unique: false },
    description: { type: String, required: false }, // patient_details ,e_health_call
    navigationScreen: { type: String, required: false },
    serviceContactNumber: { type: String, default: '' },
    servicePhoto: { type: String, default: '' },

    serviceCoverAreaAddress: [
      {
        type: String,
        required: true,
        trim: true,
        set: (value: string) => value.toUpperCase(),
      },
    ],

    medicalTests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'MedicalTest',
      },
    ],
    isDeleted: { type: Boolean, default: false },
    isAvailability: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);
export const Service = model<TService>('Service', ServiceSchema);
