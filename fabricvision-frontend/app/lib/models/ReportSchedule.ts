import mongoose, { Schema, Document } from 'mongoose';

export interface IReportSchedule extends Document {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportScheduleSchema = new Schema<IReportSchedule>(
  {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'custom'],
      default: 'daily',
      required: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter valid time in HH:MM format'],
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    lastRun: {
      type: Date,
    },
    nextRun: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.ReportSchedule || 
  mongoose.model<IReportSchedule>('ReportSchedule', ReportScheduleSchema);