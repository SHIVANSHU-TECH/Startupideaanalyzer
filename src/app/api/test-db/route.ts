import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

export async function GET() {
  try {
    console.log('Testing Firestore connection...');
    
    // Check Firebase environment variables
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    
    console.log('Firebase config check:', {
      hasProjectId: !!projectId,
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      projectId: projectId,
    });
    
    if (!projectId || !clientEmail || !privateKey) {
      console.error('❌ Missing Firebase configuration');
      return NextResponse.json({
        success: false,
        error: 'Missing Firebase configuration',
        details: 'Required Firebase Admin credentials are missing',
        missing: {
          projectId: !projectId,
          clientEmail: !clientEmail,
          privateKey: !privateKey,
        }
      }, { status: 500 });
    }
    
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      console.log('Initializing Firebase Admin SDK...');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }
    
    // Test Firestore connection
    console.log('Testing Firestore connection...');
    const db = admin.firestore();
    
    // Try a simple operation
    await db.collection('test').limit(1).get();
    
    console.log('✅ Firestore connection successful');
    
    return NextResponse.json({
      success: true,
      message: 'Firestore connection successful',
      projectId: projectId,
    });
  } catch (error: any) {
    console.error('❌ Firestore connection test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Firestore connection failed',
      details: error.message || 'Unknown error',
      stack: error.stack
    }, { status: 500 });
  }
}