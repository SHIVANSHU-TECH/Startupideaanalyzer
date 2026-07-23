# Startup Idea Analyzer - Backend API Documentation

## Overview
This document provides comprehensive information about the Startup Idea Analyzer backend API. The API is built with Next.js API routes, MongoDB with Mongoose, JWT authentication, and AI-powered analysis using OpenAI.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP address
- **Headers**: 
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when the rate limit resets

## Error Responses
All error responses follow this format:
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "subscription": {
      "plan": "free",
      "status": "active"
    },
    "preferences": {
      "emailNotifications": true,
      "analysisReminders": true
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "jwt_token_here"
}
```

### POST /api/auth/login
Authenticate a user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "subscription": {
      "plan": "free",
      "status": "active"
    },
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "token": "jwt_token_here"
}
```

### GET /api/auth/me
Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "subscription": {
      "plan": "free",
      "status": "active"
    },
    "preferences": {
      "emailNotifications": true,
      "analysisReminders": true
    },
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Ideas Endpoints

### POST /api/ideas
Submit a new startup idea for AI analysis.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "AI-Powered Personal Stylist",
  "description": "A mobile app that uses AI to recommend outfits based on a user's wardrobe, style preferences, and local weather conditions.",
  "category": "Technology"
}
```

**Response (201):**
```json
{
  "message": "Idea submitted successfully",
  "idea": {
    "id": "idea_id",
    "userId": "user_id",
    "title": "AI-Powered Personal Stylist",
    "description": "A mobile app that uses AI...",
    "category": "Technology",
    "status": "Analyzed",
    "analysis": {
      "successScore": 78,
      "marketAnalysis": "The fashion-tech market shows strong growth...",
      "swot": {
        "strengths": ["Personalized recommendations", "Weather integration"],
        "weaknesses": ["High development costs", "User acquisition challenges"],
        "opportunities": ["Growing fashion-tech market", "Mobile-first generation"],
        "threats": ["Established competitors", "Privacy concerns"]
      },
      "recommendations": [
        "Conduct user interviews to validate core assumptions",
        "Develop MVP with basic outfit matching",
        "Partner with fashion brands for inventory",
        "Focus on user experience and simplicity"
      ],
      "financialProjections": {
        "revenueProjection": "Freemium model with $5-15/month premium subscriptions",
        "costEstimate": "$100,000-200,000 for MVP development",
        "breakEvenAnalysis": "18-24 months with 10,000+ active users"
      },
      "competitorAnalysis": "Key competitors include Stitch Fix and Trunk Club...",
      "targetAudience": "Fashion-conscious millennials and Gen Z users...",
      "generatedAt": "2024-01-15T10:30:00.000Z"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### GET /api/ideas
Get all ideas for the authenticated user with pagination and filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `status` (optional): Filter by status ("Pending", "Analyzed", "Analysis Failed")
- `category` (optional): Filter by category
- `sortBy` (optional): Sort field ("createdAt", "title", "category", "status")
- `sortOrder` (optional): Sort order ("asc", "desc", default: "desc")

**Response (200):**
```json
{
  "ideas": [
    {
      "id": "idea_id",
      "title": "AI-Powered Personal Stylist",
      "category": "Technology",
      "status": "Analyzed",
      "analysis": { "successScore": 78 },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 45,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### GET /api/ideas/[id]
Get a specific idea with full analysis details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "idea": {
    "id": "idea_id",
    "userId": "user_id",
    "title": "AI-Powered Personal Stylist",
    "description": "A mobile app that uses AI...",
    "category": "Technology",
    "status": "Analyzed",
    "analysis": {
      // Full analysis object as shown in POST response
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### PUT /api/ideas/[id]
Update an existing idea and optionally trigger re-analysis.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated AI Personal Stylist",
  "description": "Updated description...",
  "category": "Technology",
  "reanalyze": true
}
```

**Response (200):**
```json
{
  "message": "Idea updated successfully",
  "idea": {
    // Updated idea object with new analysis if reanalyze was true
  }
}
```

### DELETE /api/ideas/[id]
Delete a specific idea.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Idea deleted successfully"
}
```

---

## Reports Endpoints

### POST /api/reports/[id]/generate
Generate a downloadable report (PDF or HTML) for a specific idea.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "format": "pdf"  // or "html"
}
```

**Response (201):**
```json
{
  "message": "Report generated successfully",
  "report": {
    "id": "report_id",
    "title": "AI-Powered Personal Stylist - Analysis Report",
    "format": "pdf",
    "filename": "startup_analysis_ai_powered_personal_stylist_2024-01-15.pdf",
    "shareToken": "secure_share_token",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "downloadUrl": "/api/reports/report_id/download",
  "shareUrl": "/api/reports/shared/secure_share_token"
}
```

### GET /api/reports
Get all saved reports for the authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`, `limit`, `sortBy`, `sortOrder` (same as ideas endpoint)
- `format` (optional): Filter by format ("pdf", "html")

**Response (200):**
```json
{
  "reports": [
    {
      "id": "report_id",
      "title": "AI-Powered Personal Stylist - Analysis Report",
      "format": "pdf",
      "downloadCount": 5,
      "idea": {
        "id": "idea_id",
        "title": "AI-Powered Personal Stylist",
        "category": "Technology"
      },
      "downloadUrl": "/api/reports/report_id/download",
      "shareUrl": "/api/reports/shared/share_token",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalCount": 15,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### GET /api/reports/[id]/download
Download a specific report.

**Headers:** `Authorization: Bearer <token>`

**Response:** File download with appropriate headers.

### DELETE /api/reports/[id]/download
Delete a specific report.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Report deleted successfully"
}
```

### GET /api/reports/shared/[token]
Access a shared report via public token (no authentication required).

**Response:** File download with appropriate headers.

---

## Profile Endpoints

### GET /api/profile
Get current user profile information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "profile": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "subscription": {
      "plan": "free",
      "status": "active",
      "expiresAt": null
    },
    "preferences": {
      "emailNotifications": true,
      "analysisReminders": true,
      "newsletterSubscription": false
    },
    "stats": {
      "totalIdeas": 12,
      "analyzedIdeas": 10,
      "totalReports": 5
    },
    "lastLogin": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### PUT /api/profile
Update user profile information.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated Doe",
  "preferences": {
    "emailNotifications": false,
    "analysisReminders": true,
    "newsletterSubscription": true
  }
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "profile": {
    // Updated profile object
  }
}
```

### PUT /api/profile/password
Change user password.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "currentpassword123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

---

## Data Models

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    expiresAt?: Date;
  };
  preferences: {
    emailNotifications: boolean;
    analysisReminders: boolean;
    newsletterSubscription: boolean;
  };
  stats: {
    totalIdeas: number;
    analyzedIdeas: number;
    totalReports: number;
  };
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Idea Model
```typescript
interface Idea {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: 'Pending' | 'Analyzed' | 'Analysis Failed';
  analysis?: {
    successScore: number;
    marketAnalysis: string;
    swot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    recommendations: string[];
    financialProjections?: {
      revenueProjection: string;
      costEstimate: string;
      breakEvenAnalysis: string;
    };
    competitorAnalysis?: string;
    targetAudience?: string;
    generatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Report Model
```typescript
interface Report {
  id: string;
  userId: string;
  ideaId: string;
  title: string;
  content: string; // HTML or base64 encoded PDF
  format: 'pdf' | 'html';
  mimeType: string;
  shareToken: string;
  downloadCount: number;
  createdAt: Date;
}
```

---

## Environment Variables

Required environment variables for the backend:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/startup-idea-analyzer

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-make-it-long-and-random
JWT_EXPIRES_IN=7d

# AI Service
OPENAI_API_KEY=your-openai-api-key

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Deployment

### Docker Support
The application includes Docker configuration for easy deployment:

```bash
# Build Docker image
docker build -t startup-idea-analyzer .

# Run container
docker run -p 3000:3000 --env-file .env startup-idea-analyzer
```

### Cloud Deployment
Recommended platforms:
- **Vercel**: Zero-config deployment for Next.js
- **Heroku**: Easy container deployment
- **AWS ECS**: Production-grade container orchestration
- **DigitalOcean App Platform**: Simple and cost-effective

### Database Setup
- **MongoDB Atlas**: Managed MongoDB service (recommended)
- **Local MongoDB**: For development
- **Docker MongoDB**: Containerized development setup

---

## Testing

### API Testing
Use tools like Postman, Thunder Client, or curl to test the API endpoints:

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Submit an idea (replace TOKEN with actual JWT)
curl -X POST http://localhost:3000/api/ideas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"Test Idea","description":"This is a test startup idea description that is long enough to pass validation.","category":"Technology"}'
```

### Load Testing
For production readiness, test the API under load:
- Use tools like Artillery, JMeter, or k6
- Test rate limiting effectiveness
- Monitor MongoDB performance
- Verify AI analysis response times

---

## Security Considerations

1. **JWT Security**: Use strong, unique JWT secrets in production
2. **Password Hashing**: bcrypt with salt rounds ≥ 12
3. **Rate Limiting**: Prevent abuse and DDoS attacks
4. **Input Validation**: All inputs validated with Joi schemas
5. **CORS**: Configured for specific origins
6. **Security Headers**: XSS protection, content type sniffing prevention
7. **Environment Variables**: Never commit sensitive data to git
8. **Database Security**: Use MongoDB connection with authentication
9. **API Keys**: Secure OpenAI API key storage and rotation

---

## Support

For questions, issues, or feature requests:
- Email: support@startup-idea-analyzer.com
- GitHub Issues: [Repository URL]
- Documentation: [Documentation URL]