import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Debugging environment variables...');
    
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      return NextResponse.json({
        error: 'MONGODB_URI not found in environment variables'
      }, { status: 500 });
    }
    
    console.log('MONGODB_URI length:', mongoUri.length);
    console.log('MONGODB_URI preview:', mongoUri.substring(0, 50) + '...');
    
    // Check for common issues
    const issues = [];
    
    if (mongoUri.includes('_mongodb._tcp')) {
      issues.push('Contains invalid _mongodb._tcp pattern');
    }
    
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
      issues.push('Does not start with mongodb:// or mongodb+srv://');
    }
    
    if (!mongoUri.includes('@')) {
      issues.push('Missing @ symbol (authentication required)');
    }
    
    if (!mongoUri.includes(':27017') && !mongoUri.includes('.mongodb.net')) {
      issues.push('Missing standard port 27017 or MongoDB Atlas domain');
    }
    
    return NextResponse.json({
      success: true,
      mongoUriLength: mongoUri.length,
      mongoUriPreview: mongoUri.substring(0, Math.min(50, mongoUri.length)) + (mongoUri.length > 50 ? '...' : ''),
      hasIssues: issues.length > 0,
      issues: issues,
      exampleValidUris: {
        docker: 'mongodb://admin:password123@mongodb:27017/startup-idea-analyzer?authSource=admin',
        local: 'mongodb://admin:password123@localhost:27017/startup-idea-analyzer?authSource=admin',
        atlas: 'mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority'
      }
    });
  } catch (error: any) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Debug endpoint failed',
      details: error.message
    }, { status: 500 });
  }
}