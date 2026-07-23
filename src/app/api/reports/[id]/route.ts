import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Report from '@/models/Report';
import { authenticateToken } from '@/lib/auth';

// GET /api/reports/[id] - Get specific report
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
      .populate('ideaId', 'title category');

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { report },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get report error:', error);
    
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

// DELETE /api/reports/[id] - Delete a specific report
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = authenticateToken(request);
    await connectDB();
    const { id } = await params;

    // Find and delete report, ensuring it belongs to the authenticated user
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