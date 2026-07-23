import { NextRequest, NextResponse } from 'next/server';
import { analyzeStartupIdea } from '@/lib/ai-analysis';

export async function GET() {
  try {
    console.log('Testing Groq API key...');
    
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'GROQ_API_KEY is not set in environment variables'
      }, { status: 500 });
    }
    
    console.log('Groq API key exists, length:', apiKey.length);
    
    // Test with a simple idea
    console.log('Testing Groq AI analysis...');
    const result = await analyzeStartupIdea(
      'AI Idea Analyzer',
      'A platform that analyzes startup ideas using AI and provides market insights',
      'Technology'
    );
    
    console.log('Groq AI analysis result:', {
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
    console.error('Groq test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Groq API test failed',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}