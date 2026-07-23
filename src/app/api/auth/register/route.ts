import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse request body
    const body = await request.json();

    // Validate input
    const { error, value } = registerSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.details },
        { status: 400 }
      );
    }

    const { name, email, password } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user (password will be hashed by the pre-save middleware)
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
    });

    const savedUser = await user.save();

    // Generate JWT token
    const token = generateToken({
      userId: savedUser._id.toString(),
      email: savedUser.email,
    });

    // Return user data (without password) and token
    const userResponse = {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      subscription: savedUser.subscription,
      preferences: savedUser.preferences,
      createdAt: savedUser.createdAt,
    };

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: userResponse,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}