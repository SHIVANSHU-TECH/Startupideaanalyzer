import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import { authenticateToken } from '@/lib/auth';
import { generateReportFilename } from '@/lib/report-generator';

// GET /api/reports/[id]/download - Download a specific report
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = authenticateToken(request);
    await connectDB();
    const { id } = await params;

    // Find report by ID and ensure it belongs to the authenticated user
    const report = await Report.findOne({ _id: id, userId: payload.userId })
      .populate('ideaId', 'title');

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
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
    });

    if (report.format === 'pdf') {
      headers.set('Content-Length', content.length.toString());
      return new NextResponse(content, { headers });
    } else {
      return new NextResponse(content, { headers });
    }
  } catch (error) {
    console.error('Download report error:', error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id]/download - Delete a specific report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = authenticateToken(request);
    await connectDB();
    const { id } = await params;

    // Find and delete report by ID, ensuring it belongs to the authenticated user
    const deletedReport = await Report.findOneAndDelete({ _id: id, userId: payload.userId });

    if (!deletedReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Report deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete report error:', error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}