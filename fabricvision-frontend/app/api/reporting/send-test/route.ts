import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db/mongodb';
import ReportRecipient from '@/app/lib/models/ReportRecipient';
import { sendEmail, generateReportEmailHtml } from '@/app/lib/email/emailService';
import { fetchDefectData } from '@/app/lib/report/reportGenerator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testEmail } = body;

    await connectDB();

    // Get today's date range
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    // Fetch data
    const data = await fetchDefectData({ start: startDate, end: endDate });

    // Generate email HTML
    const emailHtml = generateReportEmailHtml(data, { start: startDate, end: endDate }, true);

    // Send test email
    await sendEmail({
      to: [testEmail],
      subject: `[TEST] Fabric Defect Report - ${startDate}`,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    );
  }
}