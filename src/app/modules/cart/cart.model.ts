import mongoose, { Schema, Document } from 'mongoose';
import { MedicalTestSchema } from '../MedicalTest/medicaltest.model';
import { AppointmentTimingSchema } from '../Appointment/appointment.model';
import { TAppointmentTiming } from '../Appointment/appointment.interface';

// Interface for Medical Test in Cart
interface IMedicalTest {
  appointmentTiming: TAppointmentTiming; // Optional field
  testCode: string;
  testName: string;
  sample: string;
  mrp: number;
  discountedPrice: number;
  quantity: number;
  organization: string;
  medicalTestBanner: string;
  serviceName?: string;
}

// Interface for Cart Schema
interface ICart extends Document {
  user: Schema.Types.ObjectId;
  medicalTests: IMedicalTest[];

  // Updated to use IMedicalTest type
}

// Cart Schema for Medical Tests
const CartSchema: Schema<ICart> = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  medicalTests: [
    {
      appointmentTiming: {
        required: true,
        type: [
          {
            day: { type: String, required: true },
            startTime: { type: String, required: true },
            endTime: { type: String, required: true },
          },
        ],
      },
      testCode: { type: String, required: true },
      testName: { type: String, required: true },
      sample: { type: String, required: true },
      mrp: { type: Number, required: true },
      discountedPrice: { type: Number, required: true },
      quantity: { type: Number, required: false },
      medicalTestBanner: { type: String, required: false },
      organization: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Organization',
      },
    },
  ],
});

// Create a model for the Cart
export const Cart = mongoose.model<ICart>('Cart', CartSchema);
