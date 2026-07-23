import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authenticateToken } from '@/lib/auth';
import { updateProfileSchema, changePasswordSchema } from '@/lib/validation';

// GET /api/profile - Get current user profile
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

    // Return user profile data
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      subscription: user.subscription,
      preferences: user.preferences,
      stats: user.stats,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      { profile: userProfile },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const payload = authenticateToken(request);
    
    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate input
    const { error, value } = updateProfileSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.details },
        { status: 400 }
      );
    }

    // Find user by ID
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user fields
    const { name, preferences, subscription } = value;
    
    if (name !== undefined) user.name = name;
    
    if (preferences !== undefined) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }
    
    if (subscription !== undefined) {
      user.subscription = {
        ...user.subscription,
        ...subscription,
      };
    }

    const updatedUser = await user.save();

    // Return updated profile (without password)
    const userProfile = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      subscription: updatedUser.subscription,
      preferences: updatedUser.preferences,
      stats: updatedUser.stats,
      lastLogin: updatedUser.lastLogin,
      createdAt: updatedUser.createdAt,
    };

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        profile: userProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}