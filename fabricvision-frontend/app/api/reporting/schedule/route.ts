import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongodb';
import ReportSchedule from '@/app/lib/models/ReportSchedule';

export async function GET() {
  try {
    await connectDB();
    
    const schedule = await ReportSchedule.findOne().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: schedule || {
        frequency: 'daily',
        time: '08:00',
        dayOfWeek: 1,
        enabled: true,
      },
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();

    // Delete existing schedule and create new one
    await ReportSchedule.deleteMany({});
    const schedule = await ReportSchedule.create(body);

    // Calculate next run
    const nextRun = calculateNextRun(schedule);
    schedule.nextRun = nextRun;
    await schedule.save();

    return NextResponse.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('Error saving schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save schedule' },
      { status: 500 }
    );
  }
}

function calculateNextRun(schedule: any): Date {
  const now = new Date();
  const [hours, minutes] = schedule.time.split(':').map(Number);
  
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);

  if (schedule.frequency === 'daily') {
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else if (schedule.frequency === 'weekly') {
    const dayDiff = schedule.dayOfWeek - next.getDay();
    next.setDate(next.getDate() + (dayDiff > 0 ? dayDiff : dayDiff + 7));
    if (next <= now) {
      next.setDate(next.getDate() + 7);
    }
  } else if (schedule.frequency === 'monthly') {
    next.setDate(schedule.dayOfMonth);
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }

  return next;
}