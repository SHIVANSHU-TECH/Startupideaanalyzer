import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Idea from '@/models/Idea';
import { authenticateToken } from '@/lib/auth';
import { createIdeaSchema, getIdeasQuerySchema, updateIdeaSchema } from '@/lib/validation';
import { analyzeStartupIdea } from '@/lib/ai-analysis';

// POST /api/ideas - Submit a new idea for analysis
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const payload = authenticateToken(request);
    
    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate input
    const { error, value } = createIdeaSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.details },
        { status: 400 }
      );
    }

    const { title, description, category, tags, isPublic } = value;

    // Create idea with initial status
    const idea = new Idea({
      userId: payload.userId,
      title,
      description,
      category,
      tags: tags || [],
      isPublic: isPublic || false,
      status: 'pending', // Keep as pending initially
    });

    const savedIdea = await idea.save();

    // Return immediately without waiting for analysis
    // Analysis will be triggered separately by the client
    const populatedIdea = await Idea.findById(savedIdea._id).populate('userId', 'name email');

    return NextResponse.json(
      {
        message: 'Idea submitted successfully. Analysis will begin shortly.',
        idea: populatedIdea,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create idea error:', error);
    
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

// GET /api/ideas - Get all ideas for current user
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
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    // Validate query parameters
    const { error, value } = getIdeasQuerySchema.validate(queryParams);
    if (error) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.details },
        { status: 400 }
      );
    }

    const { page, limit, status, category, sortBy, sortOrder } = value;

    // Build query filter
    const filter: any = { userId: payload.userId };
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Build sort option
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get ideas with pagination
    const [ideas, totalCount] = await Promise.all([
      Idea.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email'),
      Idea.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        ideas,
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
    console.error('Get ideas error:', error);
    
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

// PUT /api/ideas/[id] - Update an idea and trigger analysis
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
    const { title, description, category, tags, isPublic, reanalyze } = value;
    
    if (title !== undefined) idea.title = title;
    if (description !== undefined) idea.description = description;
    if (category !== undefined) idea.category = category;
    if (tags !== undefined) idea.tags = tags || [];
    if (isPublic !== undefined) idea.isPublic = isPublic;

    // Save the updated idea first
    const updatedIdea = await idea.save();
    
    // If reanalyze is requested, trigger analysis asynchronously
    if (reanalyze || title || description || category) {
      // Update status to analyzing
      idea.status = 'analyzing';
      await idea.save();
      
      // Trigger analysis in background (don't wait for it to complete)
      triggerAnalysis(idea._id.toString()).catch(error => {
        console.error('Background analysis failed:', error);
        // Update status to failed if analysis fails
        Idea.findByIdAndUpdate(idea._id, { status: 'failed' }).catch(updateError => {
          console.error('Failed to update idea status to failed:', updateError);
        });
      });
    }
    
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

// Helper function to trigger analysis in background
async function triggerAnalysis(ideaId: string) {
  try {
    // Get the idea
    const idea = await Idea.findById(ideaId);
    if (!idea) {
      throw new Error('Idea not found');
    }
    
    // Perform AI analysis
    const analysis = await analyzeStartupIdea(
      idea.title,
      idea.description,
      idea.category
    );
    
    // Update idea with analysis results
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
    
    await idea.save();
    
    console.log(`Analysis completed for idea ${ideaId}`);
  } catch (error) {
    console.error(`Analysis failed for idea ${ideaId}:`, error);
    // Re-throw to be caught by the caller
    throw error;
  }
}