import { Schema, model } from 'mongoose';
import { TCoveredAddress } from './coveredAddress.interface';



const CoveredAddressSchema = new Schema<TCoveredAddress>(
  {
   
    name: { type: String, required: true ,unique:true,

      trim: true,
      set: (value:string) => value.toUpperCase()
    },
   
  isDeleted: { type: Boolean, default:false },

  },
  {
    timestamps: true,
  },
);
export const CoveredAddress = model<TCoveredAddress>(
  'CoveredAddress',
  CoveredAddressSchema,
);
