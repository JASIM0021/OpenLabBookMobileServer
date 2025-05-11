import { Schema, model } from 'mongoose';
import { TOrganization } from './organization.interface';

const OrganizationTimingSchema: Schema = new Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isDeleted: { type: Boolean, default:false },
  isAvailability: { type: Boolean, default:true },

});

const OrganizationSchema = new Schema<TOrganization>(
  {
    organizationCode: {
      type: String,
      required: true,
      unique: true,
    },
    organizationName: { type: String, required: true },
    organizationContactNumber: { type: String, required: true },
    organizationPhoto: { type: String, default: '' },
    organizationTiming: { type: [OrganizationTimingSchema], required: true },
    organizationAddress: { type: String, required: true },
    medicalTests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'MedicalTest',
      },
    ],
    coverAddress: [
      {
        type: String,  
        required: true,
        trim:true,
      set: (value:string) => value.toUpperCase()

      },
    ],
  isDeleted: { type: Boolean, default:false },
  isAvailability: { type: Boolean, default:true },

  },
  {
    timestamps: true,
  },
);

// OrganizationSchema.pre('save', async function (next) {
//   const isDepartmentExist = await AcademicDepartment.findOne({
//     name: this.name,
//   });

//   if (isDepartmentExist) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       'This department is already exist!',
//     );
//   }

//   next();
// });

// OrganizationSchema.pre('findOneAndUpdate', async function (next) {
//   const query = this.getQuery();
//   const isDepartmentExist = await AcademicDepartment.findOne(query);

//   if (!isDepartmentExist) {
//     throw new AppError(
//       httpStatus.NOT_FOUND,
//       'This department does not exist! ',
//     );
//   }

//   next();
// });

export const Organization = model<TOrganization>(
  'Organization',
  OrganizationSchema,
);
