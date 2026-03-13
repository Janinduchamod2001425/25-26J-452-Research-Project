import mongoose, { Schema, Document } from 'mongoose';

export interface IReportRecipient extends Document {
  name: string;
  email: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReportRecipientSchema = new Schema<IReportRecipient>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ReportRecipient || 
  mongoose.model<IReportRecipient>('ReportRecipient', ReportRecipientSchema);