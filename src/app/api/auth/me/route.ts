import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const payload = authenticateToken(request);
    
    // Connect to database
    await connectDB();

    // Find user by ID
    const user = await User.findById(payload.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      subscription: user.subscription,
      preferences: user.preferences,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      {
        user: userResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    
    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message.includes('token') || error.message.includes('expired')) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}