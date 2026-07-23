import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import { authenticateToken } from '@/lib/auth';
import { getReportsQuerySchema } from '@/lib/validation';

// GET /api/reports - Get all saved reports for current user
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const payload = authenticateToken(request);
    
    // Connect to database
    await connectDB();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      format: searchParams.get('format') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    // Validate query parameters
    const { error, value } = getReportsQuerySchema.validate(queryParams);
    if (error) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.details },
        { status: 400 }
      );
    }

    const { page, limit, format, sortBy, sortOrder } = value;

    // Build query filter
    const filter: any = { userId: payload.userId };
    if (format) filter.format = format;

    // Build sort option
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get reports with pagination
    const [reports, totalCount] = await Promise.all([
      Report.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('ideaId', 'title category status')
        .select('-content'), // Exclude content field for list view
      Report.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    // Transform reports for response
    const transformedReports = reports.map(report => ({
      id: report._id,
      title: report.title,
      format: report.format,
      mimeType: report.mimeType,
      shareToken: report.shareToken,
      downloadCount: report.downloadCount,
      createdAt: report.createdAt,
      idea: report.ideaId,
      downloadUrl: `/api/reports/${report._id}/download`,
      shareUrl: `/api/reports/shared/${report.shareToken}`,
    }));

    return NextResponse.json(
      {
        reports: transformedReports,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get reports error:', error);
    
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