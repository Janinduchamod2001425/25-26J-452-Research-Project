import mongoose, { Schema, Document } from 'mongoose';

export interface IReportFormat extends Document {
  includeImages: boolean;
  includeCharts: boolean;
  includeRawData: boolean;
  pdfFormat: boolean;
  csvFormat: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReportFormatSchema = new Schema<IReportFormat>(
  {
    includeImages: {
      type: Boolean,
      default: true,
    },
    includeCharts: {
      type: Boolean,
      default: true,
    },
    includeRawData: {
      type: Boolean,
      default: false,
    },
    pdfFormat: {
      type: Boolean,
      default: true,
    },
    csvFormat: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ReportFormat || 
  mongoose.model<IReportFormat>('ReportFormat', ReportFormatSchema);