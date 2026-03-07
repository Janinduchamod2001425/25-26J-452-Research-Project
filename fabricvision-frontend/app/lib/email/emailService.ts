import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface DefectData {
  total_frames_processed: number;
  total_defect_frames: number;
  total_non_defect_frames: number;
  defect_type_counts: Record<string, number>;
  avg_processing_time_ms: number;
  defect_rate_percentage: number;
  defect_free_rate_percentage: number;
  recent_history?: Array<{
    timestamp?: string;
    filename?: string;
    defect_count: number;
    processing_time_ms?: number;
  }>;
}

interface DateRange {
  start: string;
  end: string;
}

// Configure nodemailer with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password', // Use App Password for Gmail
  },
});

export async function sendEmail({ to, subject, html, attachments = [] }: EmailOptions): Promise<EmailResponse> {
  try {
    const mailOptions = {
      from: `"Fabric Defect Detection" <${process.env.EMAIL_USER || 'your-email@gmail.com'}>`,
      to: to.join(', '),
      subject,
      html,
      attachments: attachments.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      })),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export function generateReportEmailHtml(data: DefectData, dateRange: DateRange, includeCharts: boolean): string {
  const totalDefects = data.total_defect_frames || 0;
  const totalFrames = data.total_frames_processed || 0;
  const defectRate = totalFrames > 0 ? ((totalDefects / totalFrames) * 100).toFixed(1) : '0';
  
  // Generate chart HTML if includeCharts is true
  const chartsHtml = includeCharts ? `
    <div style="margin: 20px 0;">
      <h3 style="color: #4F46E5;">Defect Distribution</h3>
      <div style="display: flex; gap: 20px; flex-wrap: wrap;">
        <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 10px 0;">By Type</h4>
          <table style="width: 100%; border-collapse: collapse;">
            ${Object.entries(data.defect_type_counts || {}).map(([type, count]) => `
              <tr>
                <td style="padding: 5px; border-bottom: 1px solid #eee;">${type}</td>
                <td style="padding: 5px; border-bottom: 1px solid #eee; text-align: right;">${count}</td>
              </tr>
            `).join('')}
          </table>
        </div>
        <div style="background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 10px 0;">Defect Rate</h4>
          <div style="width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(#EF4444 0% ${defectRate}%, #10B981 ${defectRate}% 100%);"></div>
          <p style="text-align: center; margin-top: 10px;">${defectRate}% Defect Rate</p>
        </div>
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0;">Fabric Defect Detection Report</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Period: ${dateRange.start} to ${dateRange.end}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px;">
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #4F46E5;">${totalFrames}</div>
          <div style="color: #6B7280;">Total Frames</div>
        </div>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #EF4444;">${totalDefects}</div>
          <div style="color: #6B7280;">Defects Found</div>
        </div>
        <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #10B981;">${defectRate}%</div>
          <div style="color: #6B7280;">Defect Rate</div>
        </div>
      </div>

      ${chartsHtml}

      <div style="background: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #4F46E5; margin: 0 0 15px 0;">Defect Type Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #F9FAFB;">
              <th style="padding: 10px; text-align: left; border-bottom: 2px solid #E5E7EB;">Type</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #E5E7EB;">Count</th>
              <th style="padding: 10px; text-align: right; border-bottom: 2px solid #E5E7EB;">Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(data.defect_type_counts || {}).map(([type, count]) => {
              const percentage = totalDefects > 0 ? ((Number(count) / totalDefects) * 100).toFixed(1) : '0';
              return `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-transform: capitalize;">${type}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: right;">${count}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #E5E7EB; text-align: right;">${percentage}%</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div style="background: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #991B1B; font-size: 14px;">
          ⚠️ This is an automated report from the Fabric Defect Detection System. 
          Please review the findings and take appropriate action.
        </p>
      </div>

      <div style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>© 2026 Fabric Defect Detection System. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}