import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

export async function GET() {
  try {
    console.log('Debugging Firebase configuration...');
    
    // Check Firebase environment variables
    const firebaseConfig = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    };
    
    console.log('Firebase config check:', {
      hasProjectId: !!firebaseConfig.projectId,
      hasClientEmail: !!firebaseConfig.clientEmail,
      hasPrivateKey: !!firebaseConfig.privateKey,
      projectId: firebaseConfig.projectId,
      clientEmail: firebaseConfig.clientEmail,
    });
    
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log('Firebase Admin SDK already initialized');
      return NextResponse.json({
        success: true,
        message: 'Firebase Admin SDK already initialized',
        projectId: firebaseConfig.projectId,
      });
    }
    
    // Try to initialize Firebase
    if (firebaseConfig.projectId && firebaseConfig.clientEmail && firebaseConfig.privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          clientEmail: firebaseConfig.clientEmail,
          privateKey: firebaseConfig.privateKey.replace(/\\n/g, '\n'),
        }),
      });
      
      console.log('Firebase Admin SDK initialized successfully');
      return NextResponse.json({
        success: true,
        message: 'Firebase Admin SDK initialized successfully',
        projectId: firebaseConfig.projectId,
      });
    } else {
      console.log('Missing Firebase configuration');
      return NextResponse.json({
        success: false,
        error: 'Missing Firebase configuration',
        missing: {
          projectId: !firebaseConfig.projectId,
          clientEmail: !firebaseConfig.clientEmail,
          privateKey: !firebaseConfig.privateKey,
        }
      });
    }
  } catch (error: any) {
    console.error('Firebase debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Firebase debug failed',
      details: error.message
    }, { status: 500 });
  }
}