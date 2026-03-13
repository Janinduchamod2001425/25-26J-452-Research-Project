import mongoose, { Schema, Document } from 'mongoose';

export interface IGeneratedReport extends Document {
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  filename: string;
  pdfUrl?: string;
  csvUrl?: string;
  size: number;
  recipients: string[];
  status: 'success' | 'failed';
  error?: string;
}

const GeneratedReportSchema = new Schema<IGeneratedReport>(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    filename: {
      type: String,
      required: true,
    },
    pdfUrl: String,
    csvUrl: String,
    size: Number,
    recipients: [String],
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success',
    },
    error: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.GeneratedReport || 
  mongoose.model<IGeneratedReport>('GeneratedReport', GeneratedReportSchema);