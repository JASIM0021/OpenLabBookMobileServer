import mongoose, { Schema } from 'mongoose';
import { TMedicalTest } from './medicaltest.interface';

const OrganizationTimingSchema: Schema = new Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isAvailability: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
});

export const MedicalTestSchema: Schema = new Schema({
  testCode: { type: String, required: true, unique: false },
  testName: { type: String, required: true, unique: false },
  sample: { type: String, required: true },
  mrp: { type: Number, required: true },
  // original_mrp: { type: Number, required: true },
  discountedPrice: { type: Number, required: false },

  organizationName: { type: String, required: true },
  organizationCode: { type: String, required: true },

  organizationContactNumber: { type: String, required: true },
  organizationPhoto: { type: String, default: '' },
  medicalTestBanner: { type: String, default: '' },
  organizationTiming: { type: [OrganizationTimingSchema], required: true },

  organizationAddress: { type: String, required: true },
  coverAddress: [
    {
      type: String,
      required: true,
      trim: true,
      set: (value: string) => value.toUpperCase(),
    },
  ],
  isAvailability: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  isHomeServiceAvailable: { type: Boolean, default: false },
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  services: [
    {
      serviceName: { type: String, required: true },
      serviceRef: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
      },
    },
  ],
});

// Create a unique index on the combination of organizationName, testCode, and testName
MedicalTestSchema.index(
  { organizationName: 1, testCode: 1, testName: 1 },
  { unique: false },
);

export const MedicalTest = mongoose.model<TMedicalTest>(
  'MedicalTest',
  MedicalTestSchema,
);
