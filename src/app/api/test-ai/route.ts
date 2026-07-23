import { NextRequest, NextResponse } from 'next/server';
import { analyzeStartupIdea } from '@/lib/ai-analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category } = body;
    
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category' },
        { status: 400 }
      );
    }
    
    console.log('Testing AI analysis with:', { title, category });
    
    // Test the AI analysis
    const result = await analyzeStartupIdea(title, description, category);
    
    console.log('AI analysis result:', {
      hasSuccessScore: !!result.successScore,
      hasMarketAnalysis: !!result.marketAnalysis,
      swotLength: result.swot ? Object.keys(result.swot).length : 0
    });
    
    return NextResponse.json({
      success: true,
      result: result
    });
  } catch (error: any) {
    console.error('AI test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'AI analysis failed',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('Testing AI analysis with sample data');
    
    // Test with sample data
    const result = await analyzeStartupIdea(
      'AI-Powered Idea Analyzer',
      'A platform that uses AI to analyze startup ideas and provide market insights',
      'Technology'
    );
    
    console.log('AI analysis result:', {
      hasSuccessScore: !!result.successScore,
      hasMarketAnalysis: !!result.marketAnalysis,
      swotLength: result.swot ? Object.keys(result.swot).length : 0
    });
    
    return NextResponse.json({
      success: true,
      result: result
    });
  } catch (error: any) {
    console.error('AI test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'AI analysis failed',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}