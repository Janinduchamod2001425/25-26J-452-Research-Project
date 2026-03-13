import { NextResponse } from 'next/server';
import ReportSchedule from '@/app/lib/models/ReportSchedule';
import ReportFormat from '@/app/lib/models/ReportFormat';
import ReportRecipient from '@/app/lib/models/ReportRecipient';
import { generateAndSendReport } from '@/app/lib/report/reportGenerator';
import connectDB from '@/app/lib/db/mongodb';

export async function GET() {
  try {
    await connectDB();

    // Check if cron should run
    const schedule = await ReportSchedule.findOne();
    
    if (!schedule || !schedule.enabled) {
      return NextResponse.json({
        success: false,
        message: 'Cron job is disabled',
      });
    }

    // Check if it's time to run
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    const shouldRunToday = 
      schedule.frequency === 'daily' ||
      (schedule.frequency === 'weekly' && now.getDay() === schedule.dayOfWeek) ||
      (schedule.frequency === 'monthly' && now.getDate() === schedule.dayOfMonth);

    if (!shouldRunToday || now.getHours() !== hours || now.getMinutes() !== minutes) {
      return NextResponse.json({
        success: false,
        message: 'Not time to run yet',
      });
    }

    // Get yesterday's date for the report
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const startDate = yesterday.toISOString().split('T')[0];
    const endDate = yesterday.toISOString().split('T')[0];

    // Get format settings
    const format = await ReportFormat.findOne();
    if (!format) {
      throw new Error('Report format not configured');
    }

    // Get enabled recipients
    const recipients = await ReportRecipient.find({ enabled: true });
    if (recipients.length === 0) {
      throw new Error('No enabled recipients found');
    }

    // Generate and send report
    await generateAndSendReport(
      { start: startDate, end: endDate },
      format,
      recipients.map(r => r.email)
    );

    // Update last run
    schedule.lastRun = now;
    
    // Calculate next run
    const nextRun = new Date(now);
    nextRun.setDate(nextRun.getDate() + 1);
    nextRun.setHours(hours, minutes, 0, 0);
    schedule.nextRun = nextRun;
    
    await schedule.save();

    return NextResponse.json({
      success: true,
      message: 'Report generated and sent successfully',
      data: {
        date: startDate,
        recipients: recipients.length,
      },
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to run cron job' },
      { status: 500 }
    );
  }
}