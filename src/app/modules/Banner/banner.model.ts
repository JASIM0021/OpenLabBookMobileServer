import { Schema, model } from 'mongoose';
import { TBanner } from './banner.interface';

// name: string;
// externalLink:string;
// photoUrl:string;
// showHomePage:boolean;
// isDeleted: boolean;

const BannerSchema = new Schema<TBanner>(
  {
    name: {
      type: String,
      required: true,
      unique: true,

      trim: true,
    },
    externalLink: { type: String, default: '' },
    photoUrl: {
      type: String,
      required: true,

      trim: true,
    },
    showHomePage: { type: Boolean, default: true },

    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);
export const Banner = model<TBanner>('Banner', BannerSchema);
