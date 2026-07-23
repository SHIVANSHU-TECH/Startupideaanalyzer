import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Idea from '@/models/Idea';
import { authenticateToken } from '@/lib/auth';
import { updateIdeaSchema } from '@/lib/validation';
import { analyzeStartupIdea } from '@/lib/ai-analysis';

// GET /api/ideas/[id] - Get specific idea with analysis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = authenticateToken(request);
    await connectDB();
    const { id } = await params;

    // Find idea by ID and ensure it belongs to the authenticated user
    const idea = await Idea.findOne({ _id: id, userId: payload.userId })
      .populate('userId', 'name email');

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { idea },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get idea error:', error);
    
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

// PUT /api/ideas/[id] - Update an idea
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = authenticateToken(request);
    await connectDB();
    const { id } = await params;

    // Parse request body
    const body = await request.json();

    // Validate input
    const { error, value } = updateIdeaSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.details },
        { status: 400 }
      );
    }

    // Find idea by ID and ensure it belongs to the authenticated user
    const idea = await Idea.findOne({ _id: id, userId: payload.userId });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Update idea fields
    const { title, description, category, reanalyze } = value;
    
    if (title !== undefined) idea.title = title;
    if (description !== undefined) idea.description = description;
    if (category !== undefined) idea.category = category;

    // If reanalyze is requested or critical fields changed, perform new analysis
    if (reanalyze || title || description || category) {
      try {
        const analysis = await analyzeStartupIdea(
          idea.title,
          idea.description,
          idea.category
        );
        
        idea.analysis = {
          successScore: analysis.successScore,
          marketAnalysis: analysis.marketAnalysis,
          swot: analysis.swot,
          recommendations: analysis.recommendations,
          financialProjections: analysis.financialProjections,
          competitorAnalysis: analysis.competitorAnalysis,
          targetAudience: analysis.targetAudience,
          generatedAt: new Date(),
        };
        idea.status = 'analyzed';
      } catch (analysisError) {
        console.error('Re-analysis failed:', analysisError);
        idea.status = 'failed';
      }
    }

    const updatedIdea = await idea.save();
    
    // Populate and return the updated idea
    const populatedIdea = await Idea.findById(updatedIdea._id).populate('userId', 'name email');

    return NextResponse.json(
      {
        message: 'Idea updated successfully',
        idea: populatedIdea,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update idea error:', error);
    
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

// DELETE /api/ideas/[id] - Delete an idea
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = authenticateToken(request);
    await connectDB();
    const { id } = await params;

    // Find and delete idea by ID, ensuring it belongs to the authenticated user
    const deletedIdea = await Idea.findOneAndDelete({ _id: id, userId: payload.userId });

    if (!deletedIdea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Idea deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete idea error:', error);
    
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