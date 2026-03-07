import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongodb';
import ReportFormat from '@/app/lib/models/ReportFormat';

export async function GET() {
  try {
    await connectDB();
    
    const format = await ReportFormat.findOne().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: format || {
        includeImages: true,
        includeCharts: true,
        includeRawData: false,
        pdfFormat: true,
        csvFormat: true,
      },
    });
  } catch (error) {
    console.error('Error fetching format:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch format settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();

    // Delete existing format and create new one
    await ReportFormat.deleteMany({});
    const format = await ReportFormat.create(body);

    return NextResponse.json({
      success: true,
      data: format,
    });
  } catch (error) {
    console.error('Error saving format:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save format settings' },
      { status: 500 }
    );
  }
}