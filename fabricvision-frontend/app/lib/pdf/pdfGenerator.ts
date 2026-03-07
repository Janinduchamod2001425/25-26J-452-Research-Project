import puppeteer from 'puppeteer';
import { generateReportEmailHtml } from '../email/emailService';

export async function generatePDF(data: any, dateRange: { start: string; end: string }): Promise<Buffer> {
  try {
    // Generate HTML content
    const html = generateReportEmailHtml(data, dateRange, true);

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    
    // Set viewport and content
    await page.setViewport({ width: 1200, height: 800 });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        bottom: '20mm',
        left: '15mm',
        right: '15mm',
      },
    });

    await browser.close();

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    throw error;
  }
}