import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    issuer: 'startup-idea-analyzer',
    audience: 'startup-idea-analyzer-users'
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'startup-idea-analyzer',
      audience: 'startup-idea-analyzer-users'
    }) as JWTPayload;
    
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Middleware to authenticate requests
 */
export function authenticateToken(request: NextRequest): JWTPayload {
  const token = extractTokenFromHeader(request);
  
  if (!token) {
    throw new Error('Access token is required');
  }
  
  return verifyToken(token);
}

/**
 * Optional authentication middleware (doesn't throw if no token)
 */
export function optionalAuthentication(request: NextRequest): JWTPayload | null {
  try {
    return authenticateToken(request);
  } catch (error) {
    return null;
  }
}

/**
 * Refresh token (generate new token with extended expiry)
 */
export function refreshToken(currentToken: string): string {
  const decoded = verifyToken(currentToken);
  
  // Generate new token without iat and exp
  const newPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: decoded.userId,
    email: decoded.email
  };
  
  return generateToken(newPayload);
}