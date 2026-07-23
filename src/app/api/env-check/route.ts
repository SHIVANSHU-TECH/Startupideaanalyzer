import { NextRequest, NextResponse } from 'next/server';
import { validateEnvironmentVariables } from '@/lib/env-validator';

export async function GET(request: NextRequest) {
  try {
    const validation = validateEnvironmentVariables();
    
    // Don't expose actual values in production
    const isProduction = process.env.NODE_ENV === 'production';
    
    return NextResponse.json({
      isValid: validation.isValid,
      summary: validation.summary,
      errors: validation.errors,
      warnings: validation.warnings,
      ...(isProduction ? {} : {
        // In development, show more details (but still not actual secrets)
        envDetails: {
          NODE_ENV: process.env.NODE_ENV,
          hasOpenAIKey: !!process.env.OPENAI_API_KEY,
          openaiKeyStart: process.env.OPENAI_API_KEY?.substring(0, 8) + '...',
          firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          envKeysCount: Object.keys(process.env).length,
        }
      })
    });
  } catch (error) {
    console.error('Environment validation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to validate environment variables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}