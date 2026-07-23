import { NextRequest, NextResponse } from 'next/server';
import { analyzeStartupIdea } from '@/lib/ai-analysis';

export async function GET() {
  try {
    console.log('Testing simple Groq AI analysis...');
    
    // Test with a simple idea
    const result = await analyzeStartupIdea(
      'AI Idea Analyzer',
      'A platform that analyzes startup ideas using AI and provides market insights',
      'Technology'
    );
    
    console.log('Simple Groq AI analysis result:', {
      successScore: result.successScore,
      marketAnalysisLength: result.marketAnalysis?.length,
      swot: result.swot ? {
        strengths: result.swot.strengths.length,
        weaknesses: result.swot.weaknesses.length,
        opportunities: result.swot.opportunities.length,
        threats: result.swot.threats.length
      } : null,
      recommendations: result.recommendations?.length
    });
    
    // Check if this is a fallback response
    const isFallback = result.marketAnalysis?.includes('requires further market research');
    
    return NextResponse.json({
      success: true,
      isFallback: isFallback,
      result: result
    });
  } catch (error: any) {
    console.error('Simple Groq AI test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Groq AI analysis failed',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}