import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string;
  skipPaths?: string[];
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    keyGenerator = (req) => getClientIP(req),
    skipPaths = [],
  } = options;

  return function rateLimitMiddleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Skip rate limiting for specified paths
    if (skipPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    const key = keyGenerator(request);
    const now = Date.now();

    // Clean up expired entries
    cleanupExpiredEntries(now);

    // Get or create rate limit entry
    let rateLimitEntry = rateLimitStore.get(key);

    if (!rateLimitEntry || now > rateLimitEntry.resetTime) {
      // Create new entry or reset expired entry
      rateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, rateLimitEntry);
    } else {
      // Increment count
      rateLimitEntry.count++;
    }

    // Check if limit exceeded
    if (rateLimitEntry.count > maxRequests) {
      const resetTimeInSeconds = Math.ceil((rateLimitEntry.resetTime - now) / 1000);

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${resetTimeInSeconds} seconds.`,
          retryAfter: resetTimeInSeconds,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(rateLimitEntry.resetTime / 1000).toString(),
            'Retry-After': resetTimeInSeconds.toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (maxRequests - rateLimitEntry.count).toString());
    response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitEntry.resetTime / 1000).toString());

    return response;
  };
}

function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers (for proxy/load balancer scenarios)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip'); // Cloudflare

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to connection remote address
  return (request as any).ip || 'unknown';
}

function cleanupExpiredEntries(now: number) {
  // Clean up expired entries every 100 requests to prevent memory leak
  if (Math.random() < 0.01) {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
}

// CORS configuration
export function createCORSMiddleware(options?: {
  allowedOrigins?: string[];
  allowedMethods?: string[];
  allowedHeaders?: string[];
  allowCredentials?: boolean;
}) {
  const {
    allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://startup-idea-analyzer.vercel.app',
    ],
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
    allowCredentials = true,
  } = options || {};

  return function corsMiddleware(request: NextRequest) {
    const origin = request.headers.get('origin');
    const response = NextResponse.next();

    // Check if origin is allowed
    if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '));
    response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '));

    if (allowCredentials) {
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    return response;
  };
}

// Security headers middleware
export function createSecurityHeadersMiddleware() {
  return function securityHeadersMiddleware(_request: NextRequest) {
    const response = NextResponse.next();

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Only set HSTS in production with HTTPS
    if (process.env.NODE_ENV === 'production') {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    return response;
  };
}

// Error handling wrapper for API routes
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);

      // Handle specific error types
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }

      if (error instanceof Error) {
        // Handle JWT errors
        if (error.message.includes('jwt') || error.message.includes('token')) {
          return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
          );
        }

        // Handle validation errors
        if (error.message.includes('validation')) {
          return NextResponse.json(
            { error: 'Validation failed', details: error.message },
            { status: 400 }
          );
        }

        // Handle database connection errors
        if (error.message.includes('connection') || error.message.includes('database')) {
          return NextResponse.json(
            { error: 'Database connection error' },
            { status: 503 }
          );
        }
      }

      // Generic error response
      return NextResponse.json(
        {
          error: 'Internal server error',
          ...(process.env.NODE_ENV === 'development' && { details: error instanceof Error ? error.message : 'Unknown error' })
        },
        { status: 500 }
      );
    }
  };
}

// Logging middleware
export function createLoggingMiddleware() {
  return function loggingMiddleware(request: NextRequest) {
    const start = Date.now();
    const { method, url } = request;
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = getClientIP(request);

    console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}`);

    const response = NextResponse.next();

    // Log response time
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${response.status} - ${duration}ms`);

    return response;
  };
}