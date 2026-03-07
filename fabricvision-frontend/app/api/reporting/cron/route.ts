import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongodb';
import ReportSchedule from '@/app/lib/models/ReportSchedule';

export async function GET() {
  try {
    await connectDB();
    
    const schedule = await ReportSchedule.findOne();
    
    if (!schedule) {
      return NextResponse.json({
        success: true,
        data: {
          running: false,
          lastRun: 'Never',
          nextRun: 'Not scheduled',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        running: schedule.enabled,
        lastRun: schedule.lastRun?.toISOString() || 'Never',
        nextRun: schedule.nextRun?.toISOString() || 'Not scheduled',
        frequency: schedule.frequency,
        time: schedule.time,
      },
    });
  } catch (error) {
    console.error('Error fetching cron status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cron status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { running } = body;

    const schedule = await ReportSchedule.findOne();
    
    if (schedule) {
      schedule.enabled = running;
      await schedule.save();
    }

    return NextResponse.json({
      success: true,
      message: running ? 'Cron job started' : 'Cron job paused',
    });
  } catch (error) {
    console.error('Error updating cron status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cron status' },
      { status: 500 }
    );
  }
}