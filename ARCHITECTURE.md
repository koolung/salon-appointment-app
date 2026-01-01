# Salon Booking Platform - Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Next.js App │  │  React Pages │  │  Tailwind CSS Styling  │ │
│  │  (Client)    │  │  (Dashboard) │  │  (Responsive Design)   │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────┬──────────────────────────────────────────┘
                      │ (HTTP/REST API Calls)
┌─────────────────────v──────────────────────────────────────────┐
│                   API Layer (NestJS)                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Controllers (Routes & Request Handling)                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Services (Business Logic)                               │   │
│  │  - Appointments  - Payments  - Reports                   │   │
│  │  - Availability  - Employees - Notifications             │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Middleware & Guards (Auth, Validation)                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────┬──────────────────────────────────────────┘
                      │ (Prisma ORM)
┌─────────────────────v──────────────────────────────────────────┐
│                   Data Layer                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                     │   │
│  │  - Users, Employees, Clients                             │   │
│  │  - Services, Appointments, Payments                      │   │
│  │  - Availability Rules, Reports                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Redis (Cache & Sessions)                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Module Architecture

### 1. Auth Module
```
AuthModule
├── AuthService
│   ├── signUp()
│   ├── signIn()
│   └── validateToken()
├── AuthController
│   ├── POST /auth/sign-up
│   └── POST /auth/sign-in
└── JwtStrategy (Passport)
```

**Responsibilities:**
- User registration & login
- JWT token generation & validation
- Password hashing with bcrypt

### 2. Appointments Module (Core)
```
AppointmentsModule
├── AppointmentsService
│   ├── createAppointment()
│   ├── getAppointment()
│   ├── getAppointmentsByClient()
│   ├── getAppointmentsByEmployee()
│   ├── confirmAppointment()
│   ├── cancelAppointment()
│   ├── rescheduleAppointment()
│   ├── completeAppointment()
│   └── markNoShow()
├── AppointmentController (Protected Routes)
└── Integrations:
    ├── AvailabilityService (Slot checking)
    ├── NotificationsService (Email alerts)
    └── PaymentsService (Payment processing)
```

**Key Logic:**
- Conflict prevention with transaction locks
- Availability validation
- Time slot calculation with buffers
- Status state machine management

### 3. Availability Module
```
AvailabilityModule
├── AvailabilityService
│   ├── getAvailabilityRules()
│   ├── createAvailabilityRule()
│   ├── checkAvailability()
│   └── getAvailableSlots()
└── AvailabilityRule
    ├── Weekly recurring rules (Monday-Sunday)
    └── Exception rules (specific dates)
```

**Features:**
- Define work hours per day
- Exception dates (holidays, special schedules)
- Slot generation with configurable granularity (15 min default)
- Buffer time before/after services

### 4. Services Module
```
ServicesModule
├── ServicesService
│   ├── getAllServices()
│   ├── getServiceById()
│   ├── getServicesByCategory()
│   ├── createService()
│   └── updateService()
└── ServiceCategory
```

**Data:**
- Service name, description, price
- Duration & buffer times
- Category grouping
- Employee assignment

### 5. Employees Module
```
EmployeesModule
├── EmployeesService
│   ├── getAllEmployees()
│   ├── getEmployeeById()
│   ├── updateEmployee()
│   └── getEmployeePerformance()
└── EmployeePerformance
    ├── Appointment metrics
    ├── Revenue tracking
    └── Utilization stats
```

### 6. Payments Module
```
PaymentsModule
├── PaymentsService
│   ├── createPayment()
│   ├── completePayment()
│   ├── failPayment()
│   └── refundPayment()
└── Payment Methods
    ├── CASH
    ├── CARD
    └── ONLINE (Stripe integration)
```

### 7. Reports Module
```
ReportsModule
├── ReportsService
│   ├── getRevenueReport()
│   ├── getRevenueByService()
│   ├── getRevenueByEmployee()
│   ├── getEmployeePerformanceReport()
│   ├── getClientRetentionReport()
│   └── getAverageTicketSize()
└── Report Types
    ├── Daily/Weekly/Monthly grouping
    ├── Filtered by date range
    └── Grouped by entity
```

### 8. Notifications Module
```
NotificationsModule
├── NotificationsService
│   ├── sendBookingConfirmation()
│   ├── sendBookingModification()
│   ├── sendBookingCancellation()
│   └── sendReminderNotification()
└── Transport: Nodemailer (SMTP)
```

## Data Flow Examples

### Booking Creation Flow
```
1. Client submits booking form
   ↓
2. Frontend calls POST /appointments
   ↓
3. AppointmentsController receives request
   ↓
4. AppointmentsService.createAppointment()
   ├─ Check employee availability
   ├─ Check for conflicts
   ├─ Validate service duration
   └─ Create appointment transaction
   ↓
5. Emit AppointmentCreated event
   ↓
6. NotificationsService sends confirmation email
   ↓
7. Return appointment object
   ↓
8. Frontend redirects to dashboard
```

### Availability Checking Flow
```
1. Client selects date & employee
   ↓
2. Frontend calls GET /availability/slots?employeeId=X&date=Y
   ↓
3. AvailabilityService.getAvailableSlots()
   ├─ Load weekly rules for day
   ├─ Check for exception dates
   ├─ Generate 15-min slots
   ├─ Query existing appointments
   └─ Filter booked slots
   ↓
4. Return available slots array
   ↓
5. Frontend displays time picker
```

### Revenue Report Flow
```
1. Admin requests report for date range
   ↓
2. ReportsService.getRevenueReport()
   ├─ Query completed payments
   ├─ Group by time period (day/week/month)
   └─ Calculate totals
   ↓
3. Return grouped revenue data
   ↓
4. Frontend renders charts
```

## Database Relationships

```
User (1) ──→ (0..1) Employee
User (1) ──→ (0..1) Client
User (1) ──→ (*) Session
User (1) ──→ (*) AuditLog

Employee (1) ──→ (*) Appointment
Employee (1) ──→ (*) AvailabilityRule
Employee (1) ──→ (0..1) EmployeePerformance
Employee (*) ──→ (*) Service (many-to-many via employeeIds JSON)

Client (1) ──→ (*) Appointment

Service (1) ──→ (*) AppointmentService
Service (*) ──→ (1) ServiceCategory

Appointment (1) ──→ (*) AppointmentService
Appointment (1) ──→ (*) Payment

AvailabilityRule (1) ──→ (1) Employee (day schedule)
```

## Security Architecture

### Authentication Flow
```
1. User submits credentials
2. AuthService hashes password with bcrypt
3. JWT token generated with payload:
   {
     sub: userId,
     email: email,
     role: role,
     iat: issuedAt,
     exp: expiresAt
   }
4. Token stored in frontend localStorage
5. All requests include Authorization: Bearer <token>
6. JwtGuard validates token on protected routes
```

### Authorization (Role-Based Access Control)
```
ADMIN       - Full access, user management
EMPLOYEE    - View own appointments, update availability
RECEPTION   - Manage appointments, view employee schedules
CLIENT      - Book, view, modify own appointments
```

### Data Protection
- Password hashing: bcrypt with 10 salt rounds
- SQL injection prevention: Prisma parameterized queries
- CORS: Configured for frontend origin
- Rate limiting: Available via @nestjs/throttler
- Audit logging: All changes tracked in AuditLog table

## Scalability Considerations

### Current Approach (Single Server)
- Suitable for up to ~10,000 appointments/month
- PostgreSQL handles read/write well
- In-memory state management via Zustand (frontend)

### Future Scaling
1. **Database Optimization**
   - Add indexes on frequently queried fields
   - Implement read replicas for reports
   - Archive old appointment data

2. **Caching Layer**
   - Redis for appointment availability caching
   - Cache invalidation on booking
   - Session storage in Redis

3. **Message Queue**
   - Bull + Redis for email notifications
   - Async payment processing
   - Background job processing

4. **API Optimization**
   - GraphQL for flexible querying
   - Pagination for large datasets
   - Efficient data loading (DataLoader)

5. **Microservices (If Needed)**
   - Separate payments service
   - Notifications service
   - Reports service

## Testing Strategy

```
Unit Tests
├── Services (business logic)
├── DTOs (validation)
└── Utilities

Integration Tests
├── Database operations
├── API endpoints
└── Module interactions

E2E Tests
├── Booking workflow
├── User registration
├── Admin operations
└── Payment flow
```

## Performance Metrics

### Target SLAs
- API response time: < 200ms
- Availability: 99.5%
- Database query time: < 100ms
- Email delivery: < 5 seconds

### Monitoring Points
- Request latency
- Error rates
- Database connection pool
- Email queue size
- Cache hit ratio
