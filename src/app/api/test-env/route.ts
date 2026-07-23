import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simple environment test
    const openaiKey = process.env.OPENAI_API_KEY;
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasOpenAIKey: !!openaiKey,
        keyLength: openaiKey?.length || 0,
        keyStart: openaiKey?.substring(0, 10) + '...' || 'N/A',
        envCount: Object.keys(process.env).length,
        sampelEnvKeys: Object.keys(process.env).slice(0, 10)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Environment test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}