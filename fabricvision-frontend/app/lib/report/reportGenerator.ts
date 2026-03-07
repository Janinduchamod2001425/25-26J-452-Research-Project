import connectDB from '../db/mongodb';
import { IReportFormat } from '../models/ReportFormat';
import { generatePDF } from '../pdf/pdfGenerator';
import { generateCSV } from '../csv/csvGenerator';
import { sendEmail, generateReportEmailHtml } from '../email/emailService';
import GeneratedReport from '../models/GeneratedReport';
import { Document, Types } from 'mongoose';

interface DateRange {
  start: string;
  end: string;
}

interface Defect {
  id?: number;
  type?: string;
  confidence?: string;
  severity?: string;
  area_percentage?: number;
  bounding_box?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  location?: {
    fabricLength: string;
    xPos: string;
    yPos: string;
  };
}

interface DetectionDocument {
  _id: Types.ObjectId;
  timestamp?: string;
  filename?: string;
  summary?: {
    total_defects?: number;
    is_defect_free?: boolean;
    defect_types_found?: string[];
    overall_severity?: string;
  };
  defects?: Defect[];
  processing_time_ms?: number;
  [key: string]: any;
}

interface StatsDocument {
  _id: Types.ObjectId;
  stats_id?: string;
  avg_processing_time_ms?: number;
  [key: string]: any;
}

interface DefectData {
  total_frames_processed: number;
  total_defect_frames: number;
  total_non_defect_frames: number;
  defect_rate_percentage: number;
  defect_free_rate_percentage: number;
  defect_type_counts: Record<string, number>;
  avg_processing_time_ms: number;
  recent_history: Array<{
    timestamp?: string;
    filename?: string;
    defect_count: number;
    processing_time_ms?: number;
  }>;
}

interface Attachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

interface SendEmailOptions {
  to: string[];
  subject: string;
  html: string;
  attachments?: Attachment[];
}

interface GeneratedReportData {
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  filename: string;
  size: number;
  recipients: string[];
  status: 'success' | 'failed';
  error?: string;
}

export async function fetchDefectData(dateRange: DateRange): Promise<DefectData> {
  await connectDB();

  const startDate = new Date(dateRange.start);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(dateRange.end);
  endDate.setHours(23, 59, 59, 999);

  // Connect to the detections collection (this is in your main MongoDB)
  const mongoose = require('mongoose');
  const detectionCollection = mongoose.connection.db.collection('detections');
  const statsCollection = mongoose.connection.db.collection('statistics');

  // Get statistics for the date range
  const stats = await statsCollection.findOne({ stats_id: 'current_stats' }) as StatsDocument | null;

  // Get detections in the date range
  const detections = await detectionCollection.find({
    timestamp: {
      $gte: startDate.toISOString(),
      $lte: endDate.toISOString()
    }
  }).toArray() as DetectionDocument[];

  // Calculate metrics
  const totalFrames = detections.length;
  const defectFrames = detections.filter((d: DetectionDocument) => d.summary?.total_defects && d.summary.total_defects > 0).length;
  const defectTypesCount: Record<string, number> = {};

  detections.forEach((d: DetectionDocument) => {
    if (d.defects && Array.isArray(d.defects)) {
      d.defects.forEach((defect: Defect) => {
        const type = defect.type?.toLowerCase() || 'unknown';
        defectTypesCount[type] = (defectTypesCount[type] || 0) + 1;
      });
    }
  });

  return {
    total_frames_processed: totalFrames,
    total_defect_frames: defectFrames,
    total_non_defect_frames: totalFrames - defectFrames,
    defect_rate_percentage: totalFrames > 0 ? (defectFrames / totalFrames) * 100 : 0,
    defect_free_rate_percentage: totalFrames > 0 ? ((totalFrames - defectFrames) / totalFrames) * 100 : 100,
    defect_type_counts: defectTypesCount,
    avg_processing_time_ms: stats?.avg_processing_time_ms || 0,
    recent_history: detections.slice(-10).map((d: DetectionDocument) => ({
      timestamp: d.timestamp,
      filename: d.filename,
      defect_count: d.summary?.total_defects || 0,
      processing_time_ms: d.processing_time_ms,
    })),
  };
}

export async function generateAndSendReport(
  dateRange: DateRange,
  format: IReportFormat,
  recipients: string[]
): Promise<{ success: boolean; data: DefectData; attachments: number }> {
  try {
    // Fetch data
    const data = await fetchDefectData(dateRange);

    // Generate files
    const attachments: Attachment[] = [];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = `defect_report_${dateRange.start}_to_${dateRange.end}_${timestamp}`;

    // Generate PDF if enabled
    if (format.pdfFormat) {
      const pdfBuffer = await generatePDF(data, dateRange);
      attachments.push({
        filename: `${baseFilename}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      });
    }

    // Generate CSV if enabled
    if (format.csvFormat) {
      const csvContent = generateCSV(data, dateRange);
      attachments.push({
        filename: `${baseFilename}.csv`,
        content: Buffer.from(csvContent, 'utf-8'),
        contentType: 'text/csv',
      });
    }

    // Send email
    const emailHtml = generateReportEmailHtml(data, dateRange, format.includeCharts);
    
    await sendEmail({
      to: recipients,
      subject: `Fabric Defect Report - ${dateRange.start} to ${dateRange.end}`,
      html: emailHtml,
      attachments,
    });

    // Save report record
    const reportData: GeneratedReportData = {
      startDate: new Date(dateRange.start),
      endDate: new Date(dateRange.end),
      generatedAt: new Date(),
      filename: baseFilename,
      size: attachments.reduce((sum: number, att: Attachment) => sum + att.content.length, 0),
      recipients,
      status: 'success',
    };

    await GeneratedReport.create(reportData);

    return { success: true, data, attachments: attachments.length };
  } catch (error) {
    console.error('❌ Report generation failed:', error);
    
    // Save failed report record
    const failedReportData: GeneratedReportData = {
      startDate: new Date(dateRange.start),
      endDate: new Date(dateRange.end),
      generatedAt: new Date(),
      filename: `failed_${Date.now()}`,
      size: 0,
      recipients,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    await GeneratedReport.create(failedReportData);

    throw error;
  }
}