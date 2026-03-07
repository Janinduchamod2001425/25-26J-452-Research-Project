import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongodb';
import ReportRecipient from '@/app/lib/models/ReportRecipient';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const recipient = await ReportRecipient.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

    if (!recipient) {
      return NextResponse.json(
        { success: false, error: 'Recipient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: recipient,
    });
  } catch (error) {
    console.error('Error updating recipient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update recipient' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const recipient = await ReportRecipient.findByIdAndDelete(params.id);

    if (!recipient) {
      return NextResponse.json(
        { success: false, error: 'Recipient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Recipient deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting recipient:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete recipient' },
      { status: 500 }
    );
  }
}