import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import { generateReportFilename } from '@/lib/report-generator';

// GET /api/reports/shared/[token] - Access shared report via token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Connect to database
    await connectDB();

    const { token } = params;

    // Find report by share token
    const report = await Report.findOne({ shareToken: token })
      .populate('ideaId', 'title')
      .populate('userId', 'name');

    if (!report) {
      return NextResponse.json(
        { error: 'Shared report not found or link has expired' },
        { status: 404 }
      );
    }

    // Check if report has expired (TTL is handled by MongoDB, but we can add extra check)
    const createdAt = new Date(report.createdAt);
    const now = new Date();
    const daysDiff = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 24);
    
    if (daysDiff > 30) { // Reports expire after 30 days
      return NextResponse.json(
        { error: 'Shared report has expired' },
        { status: 410 }
      );
    }

    // Increment download count
    report.downloadCount += 1;
    await report.save();

    // Generate filename
    const filename = generateReportFilename(
      report.ideaId?.title || 'startup_analysis', 
      report.format as 'html' | 'pdf'
    );

    // Prepare content for download
    let content: Buffer | string;
    if (report.format === 'pdf') {
      content = Buffer.from(report.content, 'base64');
    } else {
      content = report.content;
    }

    // Set appropriate headers for file download
    const headers = new Headers({
      'Content-Type': report.mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
      'X-Report-Info': JSON.stringify({
        title: report.title,
        author: report.userId?.name,
        createdAt: report.createdAt,
        downloadCount: report.downloadCount,
      }),
    });

    if (report.format === 'pdf') {
      headers.set('Content-Length', content.length.toString());
      return new NextResponse(content, { headers });
    } else {
      return new NextResponse(content, { headers });
    }
  } catch (error) {
    console.error('Access shared report error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}