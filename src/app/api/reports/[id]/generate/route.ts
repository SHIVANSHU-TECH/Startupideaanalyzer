import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Idea from '@/models/Idea';
import Report from '@/models/Report';
import User from '@/models/User';
import { authenticateToken } from '@/lib/auth';
import { generatePDFReport, generateHTMLReport, generateReportFilename } from '@/lib/report-generator';
import crypto from 'crypto';

// POST /api/reports/[id]/generate - Generate PDF report for an idea
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const payload = authenticateToken(request);
    
    // Connect to database
    await connectDB();

    const { id } = params;
    
    // Parse request body to get format preference
    const body = await request.json().catch(() => ({}));
    const format = body.format || 'pdf'; // 'pdf' or 'html'

    // Find idea and ensure it belongs to the authenticated user
    const idea = await Idea.findOne({ _id: id, userId: payload.userId });
    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Check if idea has analysis
    if (!idea.analysis) {
      return NextResponse.json(
        { error: 'Idea has not been analyzed yet' },
        { status: 400 }
      );
    }

    // Get user information
    const user = await User.findById(payload.userId).select('name email');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const reportData = {
      idea,
      userInfo: {
        name: user.name,
        email: user.email,
      },
    };

    let content: string;
    let mimeType: string;
    let fileExtension: string;

    if (format === 'html') {
      content = await generateHTMLReport(reportData);
      mimeType = 'text/html';
      fileExtension = 'html';
    } else {
      // Generate PDF
      const pdfBuffer = await generatePDFReport(reportData);
      content = pdfBuffer.toString('base64');
      mimeType = 'application/pdf';
      fileExtension = 'pdf';
    }

    // Generate sharing token
    const shareToken = crypto.randomBytes(32).toString('hex');

    // Save report to database
    const report = new Report({
      userId: payload.userId,
      ideaId: id,
      title: `${idea.title} - Analysis Report`,
      content,
      format,
      mimeType,
      shareToken,
      downloadCount: 0,
    });

    const savedReport = await report.save();

    // Generate filename
    const filename = generateReportFilename(idea.title, format as 'html' | 'pdf');

    return NextResponse.json(
      {
        message: 'Report generated successfully',
        report: {
          id: savedReport._id,
          title: savedReport.title,
          format: savedReport.format,
          filename,
          shareToken: savedReport.shareToken,
          createdAt: savedReport.createdAt,
        },
        downloadUrl: `/api/reports/${savedReport._id}/download`,
        shareUrl: `/api/reports/shared/${savedReport.shareToken}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Generate report error:', error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate report. Please try again.' },
      { status: 500 }
    );
  }
}