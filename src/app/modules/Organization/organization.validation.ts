import { z } from "zod";

import { Types } from "mongoose";

// Define schema for organization timing
const OrganizationTimingSchema = z.object({
  day: z.string({
    invalid_type_error: "Day must be a string",
    required_error: "Day is required",
  }),
  startTime: z.string({
    invalid_type_error: "Start time must be a string",
    required_error: "Start time is required",
  }),
  endTime: z.string({
    invalid_type_error: "End time must be a string",
    required_error: "End time is required",
  }),

  isAvailability: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

// Define schema for the main organization schema
const createOrganizationValidationSchema = z.object({
  body: z.object({
    medicalTests: z
      .array(z.instanceof(Types.ObjectId), {
        invalid_type_error: "Medical tests must be an array of ObjectIds",
      })
      .optional(),
    organizationName: z.string({
      invalid_type_error: "Organization name must be a string",
      required_error: "Organization name is required",
    }),
    organizationContactNumber: z.string({
      invalid_type_error: "Organization contact number must be a string",
      required_error: "Organization contact number is required",
    }),
    organizationPhoto: z
      .string({
        invalid_type_error: "Organization photo URL must be a string",
      })
      .optional(),
    organizationTiming: z.array(OrganizationTimingSchema, {
      invalid_type_error: "Organization timing must be an array of objects",
      required_error: "Organization timing is required",
    }),
    organizationAddress: z.string({
      invalid_type_error: "Organization address must be a string",
      required_error: "Organization address is required",
    }),

    isAvailability: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

const updateOrganizationValidationSchema = z.object({
  body: z.object({
    medicalTests: z
      .array(z.instanceof(Types.ObjectId), {
        invalid_type_error: "Medical tests must be an array of ObjectIds",
      })
      .optional(),
    organizationName: z
      .string({
        invalid_type_error: "Organization name must be a string",
      })
      .optional(),
    organizationContactNumber: z
      .string({
        invalid_type_error: "Organization contact number must be a string",
      })
      .optional(),
    organizationPhoto: z
      .string({
        invalid_type_error: "Organization photo URL must be a string",
      })
      .optional(),
    organizationTiming: z
      .array(OrganizationTimingSchema, {
        invalid_type_error: "Organization timing must be an array of objects",
      })
      .optional(),
    organizationAddress: z
      .string({
        invalid_type_error: "Organization address must be a string",
      })
      .optional(),
    isAvailability: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

// Define schema for organization timing
const organizationAvailibityStatusSchema = z.object({
  isAvailability: z.boolean({
    invalid_type_error: "isAvailability must be a boolean",
    required_error: "isAvailability is required",
  }),
});

export const OrganizationValidation = {
  createOrganizationValidationSchema,
  updateOrganizationValidationSchema,
  organizationAvailibityStatusSchema,
};
