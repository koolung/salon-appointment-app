# Availability Management System

## Overview

The availability management system allows you to configure employee work schedules, set working hours, manage days off, and handle special exceptions. This ensures accurate appointment booking and prevents double-booking.

## Features Implemented

### ✅ Employee Work Schedules
- Set recurring weekly schedules for each employee
- Define working hours for each day of the week
- Automatic day-of-week validation
- Prevent duplicate schedules for the same day

### ✅ Daily Working Hours
- Set start and end times in HH:mm format
- 24-hour format support
- Standard business hours templates available
- Flexible scheduling for varying workdays

### ✅ Days Off Management
- Full-day off configuration
- Mark entire days as unavailable
- Quick day-off scheduling
- Exception-based approach for one-time days off

### ✅ Break Times Configuration
- Partial availability on specific days (e.g., afternoon off)
- Custom time ranges for unavailability
- Flexible break scheduling
- Support for multiple breaks per day via exceptions

### ✅ Availability Rules
- Weekly recurring rules (Monday-Sunday)
- Exception-based rules for specific dates
- Rule priority: exceptions override weekly rules
- Automatic conflict detection

### ✅ Exception Dates
- Add one-time exceptions for holidays, sick days, etc.
- Full day or partial day exceptions
- Custom time ranges for partial exceptions
- Easy exception management with date picker

## User Interface

### Main Availability Page (`/admin/availability`)
**Purpose:** Overview of all employee schedules

**Features:**
- Grid view of all employees
- Quick stats showing weekly rules and exceptions per employee
- Click to view detailed schedule
- Link to configure availability for each employee

**Actions:**
- View employee schedules
- Open detailed view
- Edit availability rules

### Availability Editor (`/admin/availability/[employeeId]`)
**Purpose:** Detailed schedule configuration for a single employee

**Two Tabs:**

#### Weekly Schedule Tab
- Add recurring schedules for Monday-Sunday
- Set start and end times
- Display current schedules
- Delete individual schedules
- Validation prevents duplicate day entries

**Form Fields:**
- Day of Week (dropdown)
- Start Time (time picker)
- End Time (time picker)
- Submit & delete buttons

**Example:**
```
Monday: 09:00 - 17:00
Tuesday: 09:00 - 17:00
Wednesday: 09:00 - 17:00
Thursday: 09:00 - 17:00
Friday: 09:00 - 17:00
Saturday: Off
Sunday: Off
```

#### Days Off & Exceptions Tab
- Add one-time exceptions
- Support for full-day offs or partial exceptions
- Date picker for easy selection
- Show all scheduled exceptions

**Exception Types:**

1. **Full Day Off** (default)
   - Employee is completely unavailable
   - Useful for holidays, sick days, personal time
   - Time slots automatically set to 00:00 - 00:00

2. **Partial Exception**
   - Custom availability hours
   - Useful for late starts, early ends, afternoon off
   - Manually set start and end times

**Example Exceptions:**
```
2024-01-15: Full day off (Holiday)
2024-01-22: 13:00 - 17:00 (Afternoon off)
2024-01-28: 09:00 - 12:00 (Morning only)
```

## API Endpoints

### Get Employee Availability Rules
```
GET /availability/:employeeId
Response: AvailabilityRule[]
```

### Create Availability Rule
```
POST /availability
Body: {
  employeeId: string,
  dayOfWeek: number (0-6),
  startTime: string (HH:mm),
  endTime: string (HH:mm),
  isException: boolean,
  exceptionDate?: DateTime
}
Response: AvailabilityRule
```

### Update Availability Rule
```
PUT /availability/:id
Body: Partial AvailabilityRule
Response: AvailabilityRule
```

### Delete Availability Rule
```
DELETE /availability/:id
Response: Success
```

### Check Employee Availability
```
POST /availability/check
Body: {
  employeeId: string,
  startTime: DateTime,
  endTime: DateTime
}
Response: boolean (true = available, false = unavailable)
```

### Get Available Time Slots
```
GET /availability/slots/:employeeId?date=YYYY-MM-DD&duration=15
Response: TimeSlot[]
```

## Database Schema

```typescript
model AvailabilityRule {
  id            String   @id @default(cuid())
  employeeId    String
  employee      Employee @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  // Weekly recurring rule (0=Monday, 6=Sunday)
  dayOfWeek     Int
  startTime     String // HH:mm format
  endTime       String // HH:mm format
  
  // Exception fields
  isException   Boolean @default(false)
  exceptionDate DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([employeeId])
  @@index([exceptionDate])
}
```

## Usage Examples

### Example 1: Standard 9-5 Schedule
1. Navigate to `/admin/availability`
2. Click on employee name
3. Go to "Weekly Schedule" tab
4. Add rules for Monday-Friday: 09:00 - 17:00
5. Saturday and Sunday: Day off (don't add rules)

### Example 2: Variable Schedule
1. Tuesday: 09:00 - 17:00
2. Wednesday: 10:00 - 18:00 (late start)
3. Thursday: 09:00 - 16:00 (early end)
4. Friday: Off (don't add rule)

### Example 3: With Exceptions
1. Set standard schedule (Mon-Fri: 09:00-17:00)
2. Add exception for New Year (2024-01-01): Full day off
3. Add exception for dentist appointment (2024-01-15): 13:00-15:00 off (partial)
4. Schedule automatically adjusts availability

## Validation Rules

1. **Time Format:** Must be HH:mm (24-hour format)
2. **Time Logic:** End time must be after start time
3. **Day Uniqueness:** Only one weekly rule per day
4. **Exception Dates:** Must be a valid date
5. **Employee Exists:** Employee must exist in system

## Integration with Appointment Booking

When creating an appointment, the system checks:

1. **Weekly Availability:** Does employee work this day?
2. **Working Hours:** Is time slot within working hours?
3. **Exception Rules:** Any special rules for this date?
4. **Existing Appointments:** No conflicts with other bookings?

**Priority:** Exceptions override weekly rules

## Best Practices

### Setting Hours
- ✅ Use 30-minute or 1-hour boundaries (09:00, 09:30, 10:00)
- ❌ Avoid arbitrary times like 09:27 (unless required)
- ✅ Keep times consistent week-to-week
- ✅ Include breaks in the calculation

### Managing Exceptions
- ✅ Add exceptions as soon as you know about them
- ✅ Use full-day off for holidays
- ✅ Use partial exceptions for late starts/early ends
- ✅ Review exceptions quarterly for upcoming dates
- ❌ Don't overuse exceptions; adjust weekly schedule instead

### Performance
- ✅ Bulk edit similar schedules together
- ✅ Use exceptions for one-time events
- ✅ Archive old exceptions (database will keep them)
- ✅ Consider copying schedules from similar staff

## Troubleshooting

### Issue: Can't add schedule for a day
**Solution:** Check if a schedule already exists for that day. Delete it first.

### Issue: Employee appears unavailable but should be available
**Solution:** Check for exception rules that might override weekly schedule.

### Issue: Appointments showing unavailable slots as available
**Solution:** Verify availability rules are saved. Try refreshing page.

### Issue: Time slots not matching availability
**Solution:** Check that start/end times use correct format (HH:mm). Calendar recalculates on save.

## Future Enhancements

Potential features to add:

1. **Shift Management**
   - Predefined shift templates
   - Multi-shift days
   - Shift swaps between employees

2. **Break Management**
   - Defined break periods (lunch, coffee)
   - Automatic break-free slot calculation
   - Employee break preferences

3. **Capacity Management**
   - Overlapping schedules with multiple staff
   - Automatic scheduling of backup staff
   - Workload balancing

4. **Bulk Operations**
   - Copy schedule from one employee to another
   - Apply same schedule to multiple employees
   - Seasonal schedule changes

5. **Analytics**
   - Hours worked per employee
   - Availability gaps report
   - Schedule optimization suggestions

## Related Features

- **Appointment Booking:** Uses availability rules to show available slots
- **Employee Management:** Create/edit employees linked to availability
- **Calendar View:** Visual display of availability and appointments
- **Reports:** Analytics on employee utilization and scheduling

## Support

For issues or questions:
1. Check database directly: `npx prisma studio`
2. Review availability rules for employee
3. Verify time format (HH:mm)
4. Check browser console for API errors
5. Review backend logs for availability checks
