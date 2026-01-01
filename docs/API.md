# API Endpoints Reference

## Base URL
```
Local Development: http://localhost:3000
Production: https://api.salonbooking.com
```

## Authentication Endpoints

### Register (Sign Up)
```
POST /auth/sign-up
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}

Response: 201 Created
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CLIENT"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Login (Sign In)
```
POST /auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Services Endpoints

### Get All Services
```
GET /services
Authorization: Bearer <token>

Query Parameters:
  - category?: string
  - isActive?: boolean

Response: 200 OK
[
  {
    "id": "service-id",
    "name": "Haircut",
    "description": "Professional haircut",
    "price": 50.00,
    "baseDuration": 30,
    "bufferBefore": 0,
    "bufferAfter": 15,
    "category": {
      "id": "cat-id",
      "name": "Hair Services"
    }
  }
]
```

### Get Service by ID
```
GET /services/:id
Authorization: Bearer <token>

Response: 200 OK
{ ... service object ... }
```

### Get Service Categories
```
GET /services/categories
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "cat-id",
    "name": "Hair Services",
    "description": "All hair-related services"
  }
]
```

## Appointments Endpoints

### Create Appointment
```
POST /appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "client-id",
  "employeeId": "employee-id",
  "startTime": "2026-01-15T10:00:00Z",
  "endTime": "2026-01-15T10:30:00Z",
  "serviceIds": ["service-id-1", "service-id-2"],
  "notes": "Optional notes"
}

Response: 201 Created
{
  "id": "appointment-id",
  "clientId": "client-id",
  "employeeId": "employee-id",
  "startTime": "2026-01-15T10:00:00Z",
  "endTime": "2026-01-15T10:30:00Z",
  "status": "PENDING",
  "services": [...],
  "createdAt": "2026-01-01T12:00:00Z"
}
```

### Get My Appointments
```
GET /appointments/my
Authorization: Bearer <token>

Query Parameters:
  - status?: string (PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW)
  - page?: number (default: 1)
  - limit?: number (default: 10)

Response: 200 OK
{
  "data": [ ... appointments ... ],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

### Get Appointment Details
```
GET /appointments/:id
Authorization: Bearer <token>

Response: 200 OK
{ ... appointment with services and payments ... }
```

### Cancel Appointment
```
PATCH /appointments/:id/cancel
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "appointment-id",
  "status": "CANCELLED",
  "cancelledAt": "2026-01-01T12:00:00Z"
}
```

### Reschedule Appointment
```
PATCH /appointments/:id/reschedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "startTime": "2026-01-20T14:00:00Z",
  "endTime": "2026-01-20T14:30:00Z"
}

Response: 200 OK
{ ... updated appointment ... }
```

### Confirm Appointment (Admin/Reception)
```
PATCH /appointments/:id/confirm
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "appointment-id",
  "status": "CONFIRMED"
}
```

### Complete Appointment (Admin/Employee)
```
PATCH /appointments/:id/complete
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "appointment-id",
  "status": "COMPLETED"
}
```

### Mark No-Show (Admin/Employee)
```
PATCH /appointments/:id/no-show
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "appointment-id",
  "status": "NO_SHOW"
}
```

## Availability Endpoints

### Get Available Slots
```
GET /availability/slots?employeeId=:id&date=:date
Authorization: Bearer <token>

Query Parameters:
  - employeeId: string (required)
  - date: YYYY-MM-DD (required)
  - duration?: number (default: 15, in minutes)

Response: 200 OK
[
  {
    "start": "2026-01-15T09:00:00Z",
    "end": "2026-01-15T09:15:00Z"
  },
  {
    "start": "2026-01-15T09:15:00Z",
    "end": "2026-01-15T09:30:00Z"
  }
]
```

### Get Employee Schedule
```
GET /availability/schedule
Authorization: Bearer <token>

Query Parameters:
  - employeeId: string (required)
  - startDate: ISO-8601 (required)
  - endDate: ISO-8601 (required)

Response: 200 OK
{
  "employeeId": "emp-id",
  "schedule": [
    {
      "date": "2026-01-15",
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

### Create Availability Rule (Admin)
```
POST /availability/rules
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "emp-id",
  "dayOfWeek": 1,  // 0=Monday, 6=Sunday
  "startTime": "09:00",
  "endTime": "17:00"
}

Response: 201 Created
{ ... rule object ... }
```

## Employees Endpoints

### Get All Employees
```
GET /employees
Authorization: Bearer <token>

Query Parameters:
  - isActive?: boolean

Response: 200 OK
[
  {
    "id": "emp-id",
    "user": {
      "id": "user-id",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@salon.com"
    },
    "position": "Senior Stylist",
    "bio": "10+ years experience",
    "performance": { ... }
  }
]
```

### Get Employee Details
```
GET /employees/:id
Authorization: Bearer <token>

Response: 200 OK
{ ... employee object with performance ... }
```

## Payments Endpoints

### Create Payment
```
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

{
  "appointmentId": "apt-id",
  "amount": 150.00,
  "method": "CARD",  // CASH, CARD, ONLINE
  "stripeId": "ch_xxx"  // optional, for Stripe payments
}

Response: 201 Created
{
  "id": "payment-id",
  "appointmentId": "apt-id",
  "amount": 150.00,
  "method": "CARD",
  "status": "PENDING"
}
```

### Get Payment
```
GET /payments/:id
Authorization: Bearer <token>

Response: 200 OK
{ ... payment object ... }
```

### Complete Payment
```
PATCH /payments/:id/complete
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "payment-id",
  "status": "COMPLETED"
}
```

### Refund Payment
```
PATCH /payments/:id/refund
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "payment-id",
  "status": "REFUNDED"
}
```

## Reports Endpoints

### Get Revenue Report
```
GET /reports/revenue
Authorization: Bearer <token>

Query Parameters:
  - startDate: ISO-8601 (required)
  - endDate: ISO-8601 (required)
  - groupBy?: 'day' | 'week' | 'month' (default: day)

Response: 200 OK
{
  "2026-01-15": 450.00,
  "2026-01-16": 320.50,
  ...
}
```

### Get Revenue by Service
```
GET /reports/revenue-by-service
Authorization: Bearer <token>

Query Parameters:
  - startDate: ISO-8601 (required)
  - endDate: ISO-8601 (required)

Response: 200 OK
{
  "Haircut": 1500.00,
  "Hair Coloring": 2800.00,
  "Styling": 950.00
}
```

### Get Revenue by Employee
```
GET /reports/revenue-by-employee
Authorization: Bearer <token>

Query Parameters:
  - startDate: ISO-8601 (required)
  - endDate: ISO-8601 (required)

Response: 200 OK
{
  "Jane Smith": 5200.00,
  "John Doe": 3800.00
}
```

### Get Employee Performance
```
GET /reports/performance
Authorization: Bearer <token>

Query Parameters:
  - startDate: ISO-8601 (required)
  - endDate: ISO-8601 (required)

Response: 200 OK
[
  {
    "id": "emp-id",
    "name": "Jane Smith",
    "totalAppointments": 45,
    "completedAppointments": 43,
    "cancelledAppointments": 1,
    "noShowAppointments": 1,
    "performance": {
      "totalRevenue": 5200.00,
      "averageTicketSize": 115.56,
      "utilizationPercentage": 88.5
    }
  }
]
```

### Get Client Retention
```
GET /reports/retention
Authorization: Bearer <token>

Query Parameters:
  - startDate: ISO-8601 (required)
  - endDate: ISO-8601 (required)

Response: 200 OK
{
  "totalClients": 125,
  "repeatClients": 45,
  "retentionRate": "36.00"
}
```

### Get Average Ticket Size
```
GET /reports/average-ticket-size
Authorization: Bearer <token>

Query Parameters:
  - startDate: ISO-8601 (required)
  - endDate: ISO-8601 (required)

Response: 200 OK
{
  "averageTicketSize": 127.50
}
```

## Notifications Endpoints

### Send Booking Confirmation
```
POST /notifications/confirmation/:appointmentId
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Confirmation email sent"
}
```

### Send Appointment Reminder
```
POST /notifications/reminder/:appointmentId
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Reminder email sent"
}
```

### Send Cancellation Notification
```
POST /notifications/cancellation/:appointmentId
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Cancellation email sent"
}
```

## Error Responses

All endpoints may return error responses:

```
400 Bad Request
{
  "statusCode": 400,
  "message": "Invalid input data",
  "error": "BadRequestException"
}

401 Unauthorized
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "UnauthorizedException"
}

403 Forbidden
{
  "statusCode": 403,
  "message": "Access denied",
  "error": "ForbiddenException"
}

404 Not Found
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "NotFoundException"
}

500 Internal Server Error
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "InternalServerErrorException"
}
```

## Rate Limiting

- Standard endpoints: 100 requests per 15 minutes
- Authentication endpoints: 5 attempts per 15 minutes
- Reports endpoints: 20 requests per hour

Headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1610234567
```
