import { NextRequest, NextResponse } from 'next/server';
import {
  createRateLimitMiddleware,
  createCORSMiddleware,
  createSecurityHeadersMiddleware,
  createLoggingMiddleware,
} from '@/lib/middleware';

// Create middleware instances
const rateLimitMiddleware = createRateLimitMiddleware({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  skipPaths: ['/api/reports/shared'], // Skip rate limiting for shared reports
});

const corsMiddleware = createCORSMiddleware({
  allowedOrigins: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://startup-idea-analyzer.vercel.app',
    'https://*.vercel.app', // Allow Vercel preview deployments
  ],
});

const securityHeadersMiddleware = createSecurityHeadersMiddleware();
const loggingMiddleware = createLoggingMiddleware();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply logging middleware (in development)
  if (process.env.NODE_ENV === 'development') {
    const logResponse = loggingMiddleware(request);
    if (logResponse !== NextResponse.next()) {
      return logResponse;
    }
  }

  // Apply CORS middleware for API routes
  if (pathname.startsWith('/api/')) {
    const corsResponse = corsMiddleware(request);
    if (corsResponse.status === 200 && request.method === 'OPTIONS') {
      return corsResponse; // Return preflight response
    }
  }

  // Apply rate limiting for API routes (except shared reports)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/reports/shared/')) {
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse.status === 429) {
      return rateLimitResponse; // Return rate limit response
    }
  }

  // Apply security headers
  const securityResponse = securityHeadersMiddleware(request);

  // Handle API routes with additional headers
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Copy security headers
    securityResponse.headers.forEach((value, key) => {
      response.headers.set(key, value);
    });

    // Add API-specific headers
    response.headers.set('Content-Type', 'application/json');
    
    return response;
  }

  return securityResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};