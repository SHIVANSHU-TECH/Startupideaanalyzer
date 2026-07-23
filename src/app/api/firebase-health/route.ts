import { NextRequest, NextResponse } from 'next/server';
import { checkFirebaseHealth } from '@/lib/firebase-health';

export async function GET(request: NextRequest) {
  try {
    const health = await checkFirebaseHealth();
    
    return NextResponse.json({
      status: 'success',
      data: health
    }, { status: 200 });
  } catch (error) {
    console.error('Firebase health check API error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check Firebase health'
    }, { status: 500 });
  }
}