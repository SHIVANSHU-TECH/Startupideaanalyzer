# Startup Idea Analyzer - Backend Setup

This document provides instructions for setting up and running the backend API for the Startup Idea Analyzer platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- OpenAI API key
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd startup-idea-analyzer
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Copy the example environment file and update with your values:
```bash
cp .env.local.example .env.local
```

Required environment variables:
```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/startup-idea-analyzer

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# Application Configuration
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Start the development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 15.5.2 with API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: OpenAI GPT-4 API
- **Validation**: Joi
- **PDF Generation**: Puppeteer
- **Security**: bcryptjs, CORS, Rate limiting

### Project Structure
```
src/
├── app/
│   └── api/                    # API routes
│       ├── auth/              # Authentication endpoints
│       ├── ideas/             # Ideas CRUD endpoints
│       ├── reports/           # Report generation endpoints
│       └── profile/           # User profile endpoints
├── lib/                       # Utility libraries
│   ├── mongodb.ts            # Database connection
│   ├── auth.ts               # JWT utilities
│   ├── validation.ts         # Joi validation schemas
│   ├── ai-analysis.ts        # AI integration
│   ├── report-generator.ts   # PDF/HTML report generation
│   └── middleware.ts         # Custom middleware
├── models/                    # Mongoose models
│   ├── User.ts               # User model
│   ├── Idea.ts               # Idea model
│   └── Report.ts             # Report model
└── middleware.ts             # Next.js middleware
```

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Ideas Management
- `POST /api/ideas` - Submit new idea for analysis
- `GET /api/ideas` - Get user's ideas with pagination/filtering
- `GET /api/ideas/[id]` - Get specific idea with analysis
- `PUT /api/ideas/[id]` - Update idea and optionally re-analyze
- `DELETE /api/ideas/[id]` - Delete idea

#### Report Generation
- `POST /api/reports/[id]/generate` - Generate PDF/HTML report
- `GET /api/reports` - Get user's reports
- `GET /api/reports/[id]/download` - Download report
- `GET /api/reports/shared/[token]` - Access shared report
- `DELETE /api/reports/[id]/download` - Delete report

#### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `PUT /api/profile/password` - Change password

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```

### Environment Variables
Create a `.env.local` file with the following variables:

```env
# Database - MongoDB Atlas or local MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/startup-idea-analyzer

# JWT - Generate a secure random string
JWT_SECRET=your-super-secret-jwt-key-make-it-very-long-and-random
JWT_EXPIRES_IN=7d

# OpenAI - Get from https://platform.openai.com/
OPENAI_API_KEY=sk-your-openai-api-key-here

# Email (Optional - for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Firebase Admin (for backend validation)
FIREBASE_ADMIN_PRIVATE_KEY=your-firebase-admin-private-key
FIREBASE_ADMIN_CLIENT_EMAIL=your-firebase-admin-client-email
FIREBASE_ADMIN_PROJECT_ID=your-firebase-project-id
```

### Database Setup

#### Option 1: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster
3. Create database user and get connection string
4. Update `MONGODB_URI` in `.env.local`

#### Option 2: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/startup-idea-analyzer`

#### Option 3: Docker MongoDB
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### AI Integration Setup

#### OpenAI Setup (Recommended)
1. Create account at [OpenAI](https://platform.openai.com/)
2. Generate API key
3. Add to `OPENAI_API_KEY` in `.env.local`

#### Alternative AI Providers
The system is designed to support multiple AI providers. You can extend `src/lib/ai-analysis.ts` to add:
- Google Gemini
- Anthropic Claude
- Groq
- Local AI models

## 🐳 Docker Deployment

### Development with Docker Compose
```bash
# Start all services (MongoDB, Redis, App)
npm run docker:dev

# Stop all services
npm run docker:stop
```

This will start:
- MongoDB on port 27017
- Redis on port 6379
- Next.js app on port 3000
- MongoDB Express (admin UI) on port 8081

### Production Docker Build
```bash
# Build production image
npm run docker:build

# Run production container
npm run docker:run
```

### Docker Environment Variables
For Docker deployment, create a `.env.production` file:

```env
NODE_ENV=production
MONGODB_URI=mongodb://mongodb:27017/startup-idea-analyzer
JWT_SECRET=your-production-jwt-secret-very-long-and-secure
OPENAI_API_KEY=your-openai-api-key
FRONTEND_URL=https://your-domain.com
```

## 🚀 Production Deployment

### Deployment Platforms

#### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

#### Heroku
```bash
# Install Heroku CLI
heroku create startup-idea-analyzer

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set OPENAI_API_KEY=your-openai-key

# Deploy
git push heroku main
```

#### AWS / Digital Ocean / Azure
Use the provided Dockerfile for container-based deployment.

### Database in Production

#### MongoDB Atlas
- Recommended for production
- Automatic backups and scaling
- Built-in security features

#### Self-hosted MongoDB
- Use MongoDB replica sets for high availability
- Implement regular backups
- Monitor performance and logs

### Performance Optimization

#### Caching
- Implement Redis for session storage
- Cache AI analysis results
- Use MongoDB indexes effectively

#### Rate Limiting
- Adjust rate limits based on usage patterns
- Implement user-specific rate limits
- Monitor and alert on rate limit violations

#### Monitoring
- Set up application monitoring (e.g., DataDog, New Relic)
- Monitor AI API usage and costs
- Track database performance metrics

## 🧪 Testing

### Manual API Testing
Use Postman, Thunder Client, or curl to test endpoints:

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Submit idea (replace YOUR_TOKEN)
curl -X POST http://localhost:3000/api/ideas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test Idea","description":"A detailed description of the test startup idea that is long enough to pass validation requirements.","category":"Technology"}'
```

### Integration Testing
Consider implementing:
- API endpoint tests with Jest
- Database integration tests
- AI service mock tests
- Rate limiting tests

## 🔒 Security

### Authentication
- JWT tokens with secure secret
- Password hashing with bcrypt (12+ salt rounds)
- Token expiration and refresh logic

### API Security
- Input validation with Joi schemas
- Rate limiting per IP and user
- CORS configuration
- Security headers (XSS, CSRF protection)

### Database Security
- MongoDB authentication required
- Connection string encryption
- Regular security updates

### Production Checklist
- [ ] Strong JWT secret (64+ characters)
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database authentication enabled
- [ ] Rate limiting configured
- [ ] Security headers implemented
- [ ] Error logging configured
- [ ] API monitoring enabled

## 📊 Monitoring

### Logs
- Application logs with structured logging
- Error tracking and alerting
- API request/response logging

### Metrics
- API response times
- Database query performance
- AI analysis success rates
- User activity patterns

### Alerts
- High error rates
- Database connection issues
- AI service failures
- Rate limit violations

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add proper error handling
- Include JSDoc comments
- Validate all inputs
- Write tests for new features

## 📝 API Documentation

Comprehensive API documentation is available in `docs/API_DOCUMENTATION.md`.

## 🆘 Troubleshooting

### Common Issues

#### MongoDB Connection Failed
```
Error: MongoServerError: Authentication failed
```
**Solution**: Check MongoDB URI, username, and password

#### OpenAI API Rate Limit
```
Error: Rate limit exceeded
```
**Solution**: Implement exponential backoff or upgrade OpenAI plan

#### JWT Token Issues
```
Error: Invalid token
```
**Solution**: Check JWT secret and token format

#### Port Already in Use
```
Error: EADDRINUSE: address already in use :::3000
```
**Solution**: Kill process or use different port
```bash
npx kill-port 3000
# or
PORT=3001 npm run dev
```

### Performance Issues

#### Slow AI Analysis
- Monitor OpenAI API response times
- Implement request timeouts
- Consider caching common analysis results

#### Database Queries
- Add appropriate indexes
- Monitor slow query logs
- Optimize aggregation pipelines

## 📞 Support

For questions or issues:
- Create GitHub issue
- Email: support@startup-idea-analyzer.com
- Documentation: [API Documentation](docs/API_DOCUMENTATION.md)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.