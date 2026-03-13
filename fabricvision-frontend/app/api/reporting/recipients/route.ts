import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongodb';
import ReportRecipient from '@/app/lib/models/ReportRecipient';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const skip = (page - 1) * limit;

    const recipients = await ReportRecipient.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ReportRecipient.countDocuments();

    return NextResponse.json({
      success: true,
      data: recipients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching recipients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recipients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Check if email already exists
    const existing = await ReportRecipient.findOne({ email: body.email });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    const recipient = await ReportRecipient.create(body);

    return NextResponse.json({
      success: true,
      data: recipient,
    });
  } catch (error) {
    console.error('Error creating recipient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create recipient' },
      { status: 500 }
    );
  }
}