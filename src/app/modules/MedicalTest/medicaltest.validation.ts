import { z } from 'zod';

const PreRequisiteCourseValidationSchema = z.object({
  course: z.string(),
  isDeleted: z.boolean().optional(),
});

const createCourseValidationSchema = z.object({
  body: z.object({
    title: z.string(),
    prefix: z.string(),
    code: z.number(),
    credits: z.number(),
    preRequisiteCourses: z.array(PreRequisiteCourseValidationSchema).optional(),
    isDeleted: z.boolean().optional(),
  }),
});


const updateMedicalTestValidationSchema = z.object({
  body: z.object({
    testCode: z.string().optional(),
    testName: z.string().optional(),
    sample: z.string().optional(),
    mrp: z.number().optional(),
    organizationName: z.string().optional(),
    organizationContactNumber: z.string().optional(),
    organizationPhoto: z.string().optional(),
    organizationTiming: z
      .array(
        z.object({
          day: z.string(),
          startTime: z.string(),
          endTime: z.string(),

    isAvailability: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
        }),
      )
      .optional(),
    organizationAddress: z.string().optional(),

    isAvailability: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isHomeServiceAvailable: z.boolean().optional(),
  }),
});

const facultiesWithCourseValidationSchema = z.object({
  body: z.object({
    faculties: z.array(z.string()),
  }),
});

const createMedicalTestValidationSchema = z.object({
  body: z.object({
    testCode: z.string().optional(),
    testName: z.string().optional(),
    sample: z.string().optional(),
    mrp: z.number().optional(),
    organizationName: z.string().optional(),
    organizationCode:z.string(),
    organizationContactNumber: z.string().optional(),
    organizationPhoto: z.string().optional(),
    organizationTiming: z
      .array(
        z.object({
          day: z.string(),
          startTime: z.string(),
          endTime: z.string(),

    isAvailability: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
        }),
      )
      .optional(),
    organizationAddress: z.string().optional(),
    isAvailability: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    isHomeServiceAvailable: z.boolean().optional(),

  }),
});
export const MedicalTesteValidations = {
  createCourseValidationSchema,
  updateMedicalTestValidationSchema,
  facultiesWithCourseValidationSchema,
  createMedicalTestValidationSchema,
};
