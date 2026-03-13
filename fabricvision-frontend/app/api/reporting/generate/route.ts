import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongodb';
import ReportFormat from '@/app/lib/models/ReportFormat';
import ReportRecipient from '@/app/lib/models/ReportRecipient';
import { generateAndSendReport } from '@/app/lib/report/reportGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get format settings
    const format = await ReportFormat.findOne();
    if (!format) {
      return NextResponse.json(
        { success: false, error: 'Report format not configured' },
        { status: 400 }
      );
    }

    // Get enabled recipients
    const recipients = await ReportRecipient.find({ enabled: true });
    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No enabled recipients found' },
        { status: 400 }
      );
    }

    // Generate and send report
    const result = await generateAndSendReport(
      { start: startDate, end: endDate },
      format,
      recipients.map(r => r.email)
    );

    return NextResponse.json({
      success: true,
      message: 'Report generated and sent successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate report' },
      { status: 500 }
    );
  }
}