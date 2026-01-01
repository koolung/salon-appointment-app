# Development & Testing Guide

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn
- Git

### Quick Start (Local)

1. **Clone & Install**
   ```bash
   git clone <repo>
   cd salon-booking
   
   # Run setup script
   bash setup.sh
   ```

2. **Configure Environment**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   
   # Frontend
   cd ../frontend
   touch .env.local
   # Add: NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Initialize Database**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Start Services**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run start:dev
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - API Docs: http://localhost:3000/api

### Docker Setup

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Database Management

### Create Migration
```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

### Seed Database
```bash
# Create seed file at prisma/seed.ts
# Then run:
npx prisma db seed
```

### Reset Database (⚠️ Caution)
```bash
npx prisma migrate reset
```

### View Database UI
```bash
npx prisma studio
```

## Testing

### Unit Tests
```bash
cd backend
npm run test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:cov
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Code Quality

### Linting
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

### Formatting
```bash
# Backend
cd backend
npm run format

# Frontend
cd frontend
npm run format
```

## API Testing

### Using cURL

**Register**
```bash
curl -X POST http://localhost:3000/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Login**
```bash
curl -X POST http://localhost:3000/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Using Postman

1. Import collection from `docs/postman-collection.json`
2. Set environment variable: `baseUrl=http://localhost:3000`
3. Set `token` from login response
4. Test endpoints

### Using REST Client (VS Code)

Create `requests.http`:
```http
### Sign Up
POST http://localhost:3000/auth/sign-up
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}

### Login
POST http://localhost:3000/auth/sign-in
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

@token = your_jwt_token_here

### Get Services
GET http://localhost:3000/services
Authorization: Bearer {{token}}
```

## Frontend Testing

### Component Testing
```bash
cd frontend
npm run test -- --watch
```

### E2E Testing with Playwright
```bash
npm install -D @playwright/test
npx playwright test
```

## Performance Testing

### Load Testing with Apache Bench
```bash
# Test booking endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/appointments/slots
```

### Using k6 for Load Testing
```bash
npm install -D k6

# Create load-test.js
# Run: k6 run load-test.js
```

## Debugging

### Backend Debugging

1. **VS Code Launch Configuration** (.vscode/launch.json)
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Launch Program",
         "program": "${workspaceFolder}/backend/src/main.ts",
         "restart": true,
         "console": "integratedTerminal",
         "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
         "preLaunchTask": "npm: build"
       }
     ]
   }
   ```

2. **Debug Mode**
   ```bash
   npm run start:debug
   ```

### Frontend Debugging
- Chrome DevTools (F12)
- React DevTools extension
- Console logging

### Database Debugging
```bash
# Connect to PostgreSQL directly
psql -U salonuser -d salon_booking -h localhost

# View all tables
\dt

# Query appointments
SELECT * FROM "Appointment" LIMIT 5;

# View indexes
\di

# Query statistics
SELECT * FROM pg_stat_statements LIMIT 10;
```

## Common Issues

### Database Connection Failed
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Or with Docker
docker-compose logs postgres

# Verify connection string in .env
DATABASE_URL="postgresql://user:password@localhost:5432/salon_booking"
```

### Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Prisma Migration Issues
```bash
# Check migration status
npx prisma migrate status

# Fix migration
npx prisma migrate resolve --rolled-back <migration_name>

# Reset and start fresh (⚠️ clears data)
npx prisma migrate reset
```

### CORS Errors
1. Ensure backend has CORS enabled
2. Check frontend API URL matches backend origin
3. Verify token is being sent in Authorization header

### JWT Token Expired
- Frontend will need to refresh token or re-login
- Implement refresh token endpoint for production

## Environment Variables Checklist

**Backend (.env)**
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
- [ ] STRIPE_SECRET_KEY (if using payments)
- [ ] REDIS_URL (if using Redis)

**Frontend (.env.local)**
- [ ] NEXT_PUBLIC_API_URL

## Production Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a strong random value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/SSL
- [ ] Configure production database with backups
- [ ] Set up Redis for caching
- [ ] Enable rate limiting
- [ ] Configure proper CORS origins
- [ ] Set up email provider (SendGrid, AWS SES, etc.)
- [ ] Enable database connection pooling
- [ ] Set up monitoring & logging
- [ ] Run database migrations
- [ ] Test all payment flows
- [ ] Set up automated backups
- [ ] Configure CDN for static assets
- [ ] Enable security headers (HSTS, CSP)
- [ ] Test error handling & 404 pages
- [ ] Verify email notifications work
- [ ] Load test the system
- [ ] Set up health check endpoints

## Useful Commands Reference

```bash
# Backend
npm run start:dev       # Dev mode with hot reload
npm run build           # Production build
npm run lint            # Lint code
npm run format          # Format code
npm run test            # Run tests
npm run test:cov        # Test coverage

# Frontend
npm run dev             # Dev server
npm run build           # Production build
npm start               # Start production server
npm run lint            # Lint
npm run format          # Format

# Database
npx prisma studio      # Open database UI
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Create and apply migration

# Git
git status              # Check changes
git add .               # Stage all changes
git commit -m "msg"     # Commit with message
git push origin main    # Push to remote
```

## Getting Help

1. Check error logs: `docker-compose logs <service>`
2. Review API docs: See `docs/API.md`
3. Check database schema: `npx prisma studio`
4. Enable debug logging in .env: `DEBUG=*`
5. Check GitHub Issues & Discussions

---

**Last Updated**: January 2026
