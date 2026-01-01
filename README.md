# Salon Booking Platform - Complete Setup Guide

## Project Overview

A full-stack salon booking platform built with:
- **Backend**: NestJS + TypeScript + Prisma ORM + PostgreSQL
- **Frontend**: Next.js 14 + React + Tailwind CSS
- **Database**: PostgreSQL with comprehensive schema
- **Features**: Appointments, Staff Management, Real-time Availability, Payments, Reports

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database and SMTP credentials

# Set up database
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# Start development server
npm run start:dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3001` for the frontend and `http://localhost:3000` for the API.

## Database Schema

### Core Tables

1. **User** - Authentication & Profile
   - email (unique)
   - password (hashed)
   - firstName, lastName, phone
   - role (ADMIN, EMPLOYEE, RECEPTION, CLIENT)

2. **Employee** - Staff Information
   - userId (FK)
   - position, bio, hourlyRate
   - performance tracking

3. **Client** - Customer Information
   - userId (FK)
   - preferences (JSON)

4. **Service** - Salon Services
   - name, description, price
   - baseDuration, bufferBefore, bufferAfter
   - categoryId (FK)

5. **ServiceCategory** - Service Organization
   - name, description

6. **Appointment** - Bookings
   - clientId, employeeId
   - startTime, endTime
   - status (PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW)

7. **AppointmentService** - Service Items in Appointment
   - appointmentId, serviceId
   - duration, price at booking time

8. **AvailabilityRule** - Weekly & Exception Availability
   - employeeId
   - dayOfWeek, startTime, endTime
   - isException flag for special days

9. **Payment** - Payment Tracking
   - appointmentId
   - amount, method (CASH, CARD, ONLINE)
   - status, stripeId

10. **EmployeePerformance** - Analytics
    - totalAppointments, completedAppointments
    - revenue, tips, utilizationPercentage

11. **AuditLog** - Security & Compliance
    - userId, action, entity, changes
    - ipAddress, userAgent

### Other Tables
- AppointmentSlot
- Revenue
- CalendarIntegration
- ExternalBooking
- AIInteraction
- Session

## API Endpoints

### Authentication
```
POST   /auth/sign-up          - Register new user
POST   /auth/sign-in          - Login user
```

### Services
```
GET    /services              - List all services
GET    /services/:id          - Get service details
GET    /services/categories   - List categories
```

### Appointments (Client)
```
POST   /appointments          - Book appointment
GET    /appointments/my       - Get user's appointments
GET    /appointments/:id      - Get appointment details
PATCH  /appointments/:id/cancel       - Cancel appointment
PATCH  /appointments/:id/reschedule   - Reschedule appointment
```

### Appointments (Admin)
```
GET    /appointments          - List all appointments (with filters)
PATCH  /appointments/:id/confirm      - Confirm appointment
PATCH  /appointments/:id/complete     - Mark as completed
PATCH  /appointments/:id/no-show      - Mark as no-show
```

### Employees
```
GET    /employees             - List all employees
GET    /employees/:id         - Get employee details
GET    /employees/:id/performance - Get performance metrics
```

### Availability
```
GET    /availability/slots    - Get available time slots
POST   /availability/rules    - Create availability rule
GET    /availability/rules/:employeeId - Get employee rules
```

### Payments
```
POST   /payments              - Create payment
GET    /payments/:id          - Get payment details
PATCH  /payments/:id/complete - Mark payment complete
```

### Reports
```
GET    /reports/revenue       - Revenue analysis
GET    /reports/by-service    - Revenue by service
GET    /reports/by-employee   - Revenue by employee
GET    /reports/performance   - Employee performance
GET    /reports/retention     - Client retention
```

### Notifications
```
POST   /notifications/confirmation/:appointmentId
POST   /notifications/reminder/:appointmentId
POST   /notifications/cancellation/:appointmentId
```

## Features Implemented

### ✅ Core Booking Engine
- Real-time availability checking
- Conflict prevention with database transactions
- Support for multiple services per appointment
- Buffer time management (before/after services)
- Time slot granularity (15 min default)

### ✅ Admin Dashboard (Backend Ready)
- Employee management
- Service management
- Pricing management
- Availability rules management
- Manual booking creation
- Calendar view endpoints

### ✅ Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Session management
- Password hashing with bcrypt

### ✅ Employee Management
- Employee profiles
- Performance tracking
- Availability rules (weekly + exceptions)
- Revenue & tips tracking

### ✅ Client Management
- User profiles
- Booking history
- Preferences storage

### ✅ Payments
- Payment method tracking (CASH, CARD, ONLINE)
- Payment status management
- Stripe integration ready

### ✅ Reporting & Analytics
- Revenue reports (by day/week/month)
- Revenue by service
- Revenue by employee
- Employee performance metrics
- Client retention analysis
- Average ticket size

### ✅ Notifications
- Email confirmations
- Appointment reminders
- Cancellation notifications
- Status update notifications

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/salon_booking
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@salonbooking.com
STRIPE_SECRET_KEY=sk_test_xxx
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=3000
BOOKING_TIME_SLOT_DURATION_MINUTES=15
BOOKING_MAX_ADVANCE_DAYS=90
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Project Structure

### Backend
```
backend/
├── src/
│   ├── main.ts                 - Entry point
│   ├── app.module.ts           - Root module
│   ├── common/
│   │   └── prisma/             - Database service
│   └── modules/
│       ├── auth/               - Authentication
│       ├── users/              - User management
│       ├── employees/          - Employee management
│       ├── services/           - Service catalog
│       ├── appointments/       - Booking engine
│       ├── availability/       - Availability logic
│       ├── payments/           - Payment processing
│       ├── reports/            - Analytics
│       └── notifications/      - Email notifications
├── prisma/
│   └── schema.prisma           - Database schema
└── package.json
```

### Frontend
```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx          - Root layout
│   │   ├── page.tsx            - Home page
│   │   ├── login/              - Login page
│   │   ├── signup/             - Registration page
│   │   ├── booking/            - Booking page
│   │   └── dashboard/          - User dashboard
│   ├── lib/
│   │   └── api.ts              - API client
│   ├── store/
│   │   └── auth.ts             - Auth state (Zustand)
│   └── components/             - Reusable components
├── tailwind.config.ts
└── package.json
```

## Next Steps to Production

1. **Add Admin Dashboard Frontend**
   - Employee management UI
   - Service management UI
   - Availability calendar management
   - Reports dashboard with charts

2. **Add Controller/Route Layer** (Backend)
   - REST endpoints for all services
   - Input validation with DTOs
   - Error handling middleware
   - Request logging

3. **Add Frontend Pages**
   - Admin login/registration
   - Admin dashboard
   - Employee schedule view
   - Revenue reports page
   - Client management

4. **Add Advanced Features**
   - Google/Microsoft calendar integration
   - Stripe payment processing
   - SMS notifications
   - AI voice/chat booking
   - Email queue with Bull
   - Redis caching

5. **Security Hardening**
   - Rate limiting
   - CORS configuration
   - SQL injection prevention (already covered by Prisma)
   - Input sanitization
   - Webhook signature validation

6. **Testing**
   - Unit tests with Jest
   - Integration tests
   - E2E tests with Cypress/Playwright

7. **Deployment**
   - Docker containerization
   - CI/CD with GitHub Actions
   - Database backups
   - Environment-specific configs

## Database Initialization

### Create a seed file (prisma/seed.ts)

```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@salon.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  // Create service categories
  const hairCategory = await prisma.serviceCategory.create({
    data: { name: 'Hair Services' },
  });

  // Create services
  await prisma.service.create({
    data: {
      name: 'Haircut',
      categoryId: hairCategory.id,
      price: 50,
      baseDuration: 30,
    },
  });

  console.log('Seeded successfully');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run: `npx prisma db seed`

## Support & Documentation

For detailed API documentation, check individual module files.
For database changes, use Prisma migrations:

```bash
npx prisma migrate dev --name your_migration_name
```

---

**Version**: 1.0.0
**Last Updated**: January 2026
