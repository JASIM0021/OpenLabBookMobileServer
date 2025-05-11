import { z } from 'zod';
import { appointmentPayment, paymentType } from './appointment.constant';

const AppointmentTimingSchema = z.object({
  day: z.string().nonempty({ message: 'Day is required' }),
  startTime: z.string().nonempty({ message: 'Start time is required' }),
  endTime: z.string().nonempty({ message: 'End time is required' }),
});
const PatientInfoSchema = z.object({
  name: z.string().nonempty({ message: 'Name is required' }),
  contactNumber: z.string().nonempty({ message: 'Contact number is required' }),
  age: z.number().min(0, { message: 'Age must be a positive number' }),
  sex: z.enum(['MALE', 'FEMALE', 'OTHER'], { message: 'Invalid sex value' }),
  referBy: z.string().optional(),
  pinCode: z.string().optional(),
  address: z.string().optional(),
  prescription: z.array(z.string()).optional(),
});

const createAppointment = z.object({
  body: z.object({
    organization: z
      .string({
        required_error: 'Organization Id is required!',
      })
      .nonempty(),

    paymentStatus: z.enum([...appointmentPayment] as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid payment status' }),
    }),

    paymentType: z.enum([...paymentType] as [string, ...string[]], {
      errorMap: () => ({ message: 'Invalid payment type' }),
    }),
    notes: z.string().optional(),
    review: z.string().optional(),
    reportPhoto: z.string().optional(),
    prescriptionPhoto: z.string().optional(),
    patientInfo: PatientInfoSchema,
    medicalTestLists: z
      .array(
        z.object({
          testCode: z.string(),
          testName: z.string(),
          sample: z.string(),
          mrp: z.number(),
          appointmentTiming: AppointmentTimingSchema,
        }),
      )
      .min(1, { message: 'At least one medical test is required' }),
  }),
});

export const AppointmentValidation = {
  createAppointment,
};
