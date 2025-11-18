# Module 09: Holiday Management

## Module Overview

**Module Name:** Holiday Management  
**Module ID:** 09  
**Purpose:** Centralized holiday calendar management for India and USA locations, with personalized holiday views for employees based on accepted swap holiday requests. Holidays fetched from external Downtown API system and integrated across leave management, attendance, and dashboard modules.

**Technology Stack:**
- Backend: ASP.NET Core 8.0 Web API
- External API: Downtown API (holiday data source)
- HTTP Client: Named HttpClient (DownTownClient)
- Data Models: DTO-based with AutoMapper for transformations
- Integration: Dashboard, Leave Management, Attendance modules

**Key Capabilities:**
- Fetch holidays from external Downtown API
- Support for India and USA holiday calendars
- Personalized holiday lists based on employee swap requests
- Upcoming holidays display on dashboard
- Holiday validation for leave applications
- Holiday swap functionality (employees can exchange holidays for working days)

---

## Architecture Overview

### Components

**1. DownTownClient (HTTP Client)**
- **Location:** `HRMS.Application/Clients/DownTownClient.cs`
- **Purpose:** Fetch holiday data from external Downtown API
- **Base URL:** Configured in appsettings.json under `HttpClientsUrl.DownTownApiUrl`
- **Authentication:** API token in HTTP header `apitoken`

**Methods:**
- `GetHolidayListAsync()`: Fetch all holidays (India + USA)
- `GetUpcomingHolidayListAsync()`: Fetch upcoming holidays (next 30 days)

**2. DashboardService**
- **Location:** `HRMS.Application/Services/DashboardService.cs`
- **Purpose:** Expose holiday data for dashboard display
- **Methods:**
  - `GetHolidayList()`: All holidays for current year
  - `GetUpcomingHolidayList()`: Upcoming holidays (next 30-60 days)

**3. LeaveManagementService**
- **Location:** `HRMS.Application/Services/LeaveManagementService.cs`
- **Purpose:** Personalized holiday lists for leave application validation
- **Method:**
  - `GetPersonalizedHolidayListAsync(long employeeId)`: Holidays adjusted for employee's accepted swap requests

**4. Data Models**
- **HolidayData (Downtown API Response):** `Holidays` object with `India` and `USA` lists
- **HolidayDto (Internal DTO):** `date`, `name`, `day` fields
- **HolidayResponseDto (API Response):** Separate lists for India and USA
- **SwapHolidayDto:** Tracking swapped holidays (employee-specific modifications)

---

## Features List

### Feature 1: Fetch All Holidays from External API
**Description:** Retrieve complete holiday calendar for India and USA locations from external Downtown API system.

**Business Rules:**
- Holidays fetched from external Downtown API (not stored in HRMS database)
- Real-time fetch on every request (no caching)
- Supports two countries: India and USA
- Holiday data includes: date, name, day of week
- Date format: MM/DD/YYYY (US format)
- If API fails or returns no data, empty list returned

**Data Flow:**
1. Client requests holidays: `GET /api/Dashboard/GetHolidayList`
2. DashboardService calls `downTownClient.GetHolidayListAsync()`
3. DownTownClient sends HTTP GET to `{DownTownApiUrl}/holidays`
4. Downtown API returns:
```json
{
  "status": true,
  "message": "Success",
  "data": {
    "holidays": {
      "India": [
        { "date": "01/26/2025", "name": "Republic Day", "day": "Sunday" },
        { "date": "03/14/2025", "name": "Holi", "day": "Friday" },
        { "date": "08/15/2025", "name": "Independence Day", "day": "Friday" }
      ],
      "USA": [
        { "date": "01/01/2025", "name": "New Year's Day", "day": "Wednesday" },
        { "date": "07/04/2025", "name": "Independence Day", "day": "Friday" },
        { "date": "11/27/2025", "name": "Thanksgiving", "day": "Thursday" }
      ]
    }
  }
}
```
5. DownTownClient deserializes to `DowntownResponse<HolidayData>`
6. DashboardService maps to `HolidayResponseDto` using AutoMapper
7. API returns `ApiResponseModel<HolidayResponseDto>` with India and USA lists

**Use Cases:**
- Dashboard displays holiday calendar
- Leave application form validates leave dates against holidays
- Attendance report excludes holidays from working days
- HR views complete holiday calendar for planning

---

### Feature 2: Upcoming Holidays for Dashboard Display
**Description:** Display upcoming holidays (next 30-60 days) on employee dashboard for quick reference.

**Business Rules:**
- Fetch only upcoming holidays from external API
- Upcoming = holidays within next 30-60 days from today
- Separate lists for India and USA
- Sorted by date (ascending)
- Used for dashboard widget display
- If no upcoming holidays, empty list returned

**Data Flow:**
1. Dashboard page loads, calls `GET /api/Dashboard/GetUpcomingHolidayList`
2. DashboardService calls `downTownClient.GetUpcomingHolidayListAsync()`
3. DownTownClient fetches from `{DownTownApiUrl}/upcomingHolidays`
4. Downtown API returns filtered upcoming holidays:
```json
{
  "status": true,
  "data": {
    "upcomingHolidays": {
      "India": [
        { "date": "11/01/2025", "name": "Diwali", "day": "Friday" },
        { "date": "12/25/2025", "name": "Christmas", "day": "Thursday" }
      ],
      "USA": [
        { "date": "11/27/2025", "name": "Thanksgiving", "day": "Thursday" },
        { "date": "12/25/2025", "name": "Christmas", "day": "Thursday" }
      ]
    }
  }
}
```
5. DashboardService maps to `HolidayResponseDto`
6. Frontend displays holidays in dashboard widget

**UI Display:**
```
Upcoming Holidays (India)
- Nov 01, 2025: Diwali (Friday)
- Dec 25, 2025: Christmas (Thursday)
```

---

### Feature 3: Personalized Holiday List for Employees
**Description:** Generate employee-specific holiday list by adjusting company holidays based on accepted swap holiday requests.

**Business Rules:**
- Base holiday list fetched from Downtown API
- Subtract holidays swapped by employee (working day for employee)
- Add new holidays gained from swap requests (off day for employee)
- Swap limit: 2 swaps per employee per year
- Only approved swap requests affect personalized list
- Used for leave application validation
- Date format conversion: MM/DD/YYYY from API, stored as DateTime in swap table

**Data Flow:**
1. Employee opens leave application form
2. Frontend calls `GET /api/EmployeeLeave/GetPersonalizedHolidayList/{employeeId}`
3. LeaveManagementService calls `GetPersonalizedHolidayListAsync(employeeId)`
4. Service fetches base holidays from Downtown API
5. Service queries accepted swap requests for employee:
```sql
SELECT WorkedDate, RequestedOffDate FROM CompOffAndSwapHolidayDetail
WHERE EmployeeId = @EmployeeId AND Type = 'swap' AND Status = 'Accepted'
```
6. **Example Swap Processing:**
   - Base India Holidays: [Jan 26, Mar 14, Aug 15, Oct 02, Nov 01, Dec 25]
   - Employee Swaps:
     - Swap 1: Give up "Aug 15 (Independence Day)" → Work on Aug 15, Get off on Aug 20
     - Swap 2: Give up "Nov 01 (Diwali)" → Work on Nov 01, Get off on Nov 05
   - Personalized Holidays: [Jan 26, Mar 14, Oct 02, Dec 25, Aug 20, Nov 05]
7. Service removes swapped holidays from base list (workingDate matches holiday date)
8. Service adds new holidays from swap requests (requestedOffDate)
9. Service sorts personalized holidays by date (ascending)
10. API returns personalized holiday list to employee

**Validation Logic:**
- Leave application checks if date is in personalized holiday list
- If date is holiday: Show warning "Selected date is a holiday"
- Leave days calculation excludes personalized holidays

**Example Scenario:**
```
Employee: Jane Doe (India)
Base Holidays: 10 company holidays
Accepted Swaps:
  - Swapped Aug 15 (Independence Day) for Aug 20 (Regular working day)
  
Leave Application:
  - Aug 14-16: System checks personalized holidays
  - Aug 15 NOT in personalized list (swapped, now working day)
  - System allows leave application for Aug 15
  - Total leave days: 3 days (Aug 14, 15, 16)
  
  - Aug 19-21: System checks personalized holidays
  - Aug 20 IS in personalized list (gained from swap)
  - System shows warning: "Aug 20 is a holiday, leave not required"
```

---

### Feature 4: Holiday Calendar Display on Dashboard
**Description:** Display monthly holiday calendar on dashboard with country filter (India/USA).

**Business Rules:**
- Holiday calendar widget on dashboard home page
- Default view: India holidays (if employee country = India)
- Country toggle: Switch between India and USA holidays
- Monthly view with holiday markers
- Hover over date shows holiday name
- Click holiday shows details (name, day, type)

**UI Components:**
- Calendar component (React Big Calendar or custom calendar)
- Holiday markers (colored dots/badges on dates)
- Country filter dropdown (India/USA)
- Holiday details modal on click

**Data Integration:**
1. Dashboard loads, fetches all holidays via `GetHolidayList`
2. Frontend filters holidays by selected country
3. Calendar component maps holidays to dates
4. Holiday dates highlighted with different color
5. Tooltip shows holiday name on hover

**Example Display:**
```
Holiday Calendar - October 2025 (India)

Sun  Mon  Tue  Wed  Thu  Fri  Sat
          1    2🔴   3    4    5
                  (Gandhi Jayanti)
6    7    8    9    10   11   12
13   14   15   16   17   18   19
20   21   22   23   24   25   26
27   28   29   30   31
```

---

### Feature 5: Holiday Validation in Leave Application
**Description:** Prevent employees from applying leave on company holidays (holidays are non-working days).

**Business Rules:**
- Leave application validates start/end dates against personalized holiday list
- If any date in range is holiday: Show warning (not error, can proceed)
- Warning message: "Your leave includes holidays: [dates]. Leave balance will not be deducted for these days."
- Leave days calculation excludes holidays
- Example: Apply leave Oct 1-5 (5 days)
  - Oct 2 is holiday (Gandhi Jayanti)
  - Actual leave days deducted: 4 days
  - System shows: "Applied: 5 days, Holidays: 1 day, Leave deducted: 4 days"

**Validation Flow:**
1. Employee selects start date and end date in leave form
2. Frontend calls `GetPersonalizedHolidayList` API
3. Frontend calculates leave days:
   - Total days = end date - start date + 1
   - For each day in range:
     - If day is Saturday/Sunday: Skip (weekend)
     - If day is in personalized holiday list: Skip
     - Else: Count as leave day
4. Frontend displays leave days breakdown:
   - Total days: 7
   - Weekends: 2
   - Holidays: 1
   - Leave days: 4
5. Employee submits leave application
6. Backend validates leave days calculation (same logic)
7. Leave balance deducted: 4 days

**Example:**
```
Leave Application Form:
Start Date: Oct 30, 2025 (Thursday)
End Date: Nov 05, 2025 (Wednesday)
Total Days: 7 days

Breakdown:
- Oct 30 (Thu): Leave day ✓
- Oct 31 (Fri): Leave day ✓
- Nov 01 (Sat): Weekend (skipped)
- Nov 02 (Sun): Weekend (skipped)
- Nov 03 (Mon): Holiday - Diwali (skipped)
- Nov 04 (Tue): Leave day ✓
- Nov 05 (Wed): Leave day ✓

Leave Balance Deducted: 4 days
```

---

### Feature 6: Holiday Integration with Attendance Reports
**Description:** Exclude holidays from attendance reports and working days calculation.

**Business Rules:**
- Attendance reports exclude holidays from expected working days
- If employee worked on holiday: Mark as "Holiday Work" (potential comp-off)
- Attendance percentage calculation excludes holidays:
  - Working Days = Total Days - Weekends - Holidays - Leaves
  - Attendance % = (Days Present / Working Days) × 100
- Holiday work tracked for comp-off eligibility

**Report Calculation:**
```
Month: October 2025
Total Days: 31
Weekends: 8 (4 Saturdays + 4 Sundays)
Holidays: 1 (Oct 02 - Gandhi Jayanti)
Leaves: 2 (Employee on leave)
Expected Working Days: 31 - 8 - 1 - 2 = 20 days
Days Present: 19 days
Attendance %: (19/20) × 100 = 95%
```

---

## Data Models

### 1. HolidayData (Downtown API Response)
**Purpose:** DTO for Downtown API holiday response.

```csharp
public class HolidayData
{
    public Holidays holidays { get; set; } = new Holidays();
}

public class Holidays
{
    public List<Holiday> India { get; set; } = new List<Holiday>();
    public List<Holiday> USA { get; set; } = new List<Holiday>();
}

public class Holiday
{
    public string date { get; set; }  // Format: MM/DD/YYYY
    public string name { get; set; }
    public string day { get; set; }   // Monday, Tuesday, etc.
}
```

**Sample JSON:**
```json
{
  "holidays": {
    "India": [
      { "date": "01/26/2025", "name": "Republic Day", "day": "Sunday" },
      { "date": "08/15/2025", "name": "Independence Day", "day": "Friday" }
    ],
    "USA": [
      { "date": "07/04/2025", "name": "Independence Day", "day": "Friday" }
    ]
  }
}
```

---

### 2. HolidayResponseDto (API Response)
**Purpose:** HRMS API response for holidays.

```csharp
public class HolidayResponseDto
{
    public List<HolidayDto> India { get; set; } = new List<HolidayDto>();
    public List<HolidayDto> USA { get; set; } = new List<HolidayDto>();
}

public class HolidayDto
{
    public string date { get; set; }
    public string name { get; set; }
    public string day { get; set; }
}
```

**Sample Response:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "india": [
      { "date": "01/26/2025", "name": "Republic Day", "day": "Sunday" },
      { "date": "03/14/2025", "name": "Holi", "day": "Friday" }
    ],
    "usa": [
      { "date": "01/01/2025", "name": "New Year's Day", "day": "Wednesday" },
      { "date": "07/04/2025", "name": "Independence Day", "day": "Friday" }
    ]
  }
}
```

---

### 3. UpcomingHolidayData (Downtown API Response)
**Purpose:** DTO for upcoming holidays (filtered by Downtown API).

```csharp
public class UpcomingHolidayData
{
    public Holidays upcomingHolidays { get; set; } = new Holidays();
}
```

**Structure:** Same as `Holidays` but filtered for upcoming dates.

---

### 4. SwapHolidayDto (Employee Swap Tracking)
**Purpose:** Track holidays swapped by employee for personalized holiday list.

```csharp
public class SwapHolidayDto
{
    public long Id { get; set; }
    public long EmployeeId { get; set; }
    public DateTime WorkedDate { get; set; }      // Holiday given up (now working day)
    public DateTime RequestedOffDate { get; set; } // New holiday (gained from swap)
    public string Reason { get; set; }
    public LeaveStatus Status { get; set; }        // Pending, Accepted, Rejected
    public DateTime CreatedOn { get; set; }
}
```

**Sample Data:**
```json
{
  "id": 12345,
  "employeeId": 5678,
  "workedDate": "2025-08-15",
  "requestedOffDate": "2025-08-20",
  "reason": "Family function on Aug 20",
  "status": "Accepted",
  "createdOn": "2025-07-20T10:30:00Z"
}
```

---

## API Endpoints

### 1. GET /api/Dashboard/GetHolidayList
**Purpose:** Fetch all holidays for current year (India + USA).

**Request:** None (no parameters)

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "india": [
      { "date": "01/26/2025", "name": "Republic Day", "day": "Sunday" },
      { "date": "08/15/2025", "name": "Independence Day", "day": "Friday" }
    ],
    "usa": [
      { "date": "07/04/2025", "name": "Independence Day", "day": "Friday" }
    ]
  }
}
```

**Error Responses:**
- **500 Internal Server Error:** Downtown API unavailable
```json
{
  "statusCode": 500,
  "message": "Failed to fetch holidays from external API",
  "result": null
}
```

**Authorization:** Yes (JWT token required)  
**Permissions:** None (all authenticated users can access)

---

### 2. GET /api/Dashboard/GetUpcomingHolidayList
**Purpose:** Fetch upcoming holidays (next 30-60 days).

**Request:** None

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "india": [
      { "date": "11/01/2025", "name": "Diwali", "day": "Friday" },
      { "date": "12/25/2025", "name": "Christmas", "day": "Thursday" }
    ],
    "usa": [
      { "date": "11/27/2025", "name": "Thanksgiving", "day": "Thursday" }
    ]
  }
}
```

**Authorization:** Yes  
**Permissions:** None

---

### 3. GET /api/EmployeeLeave/GetPersonalizedHolidayList/{employeeId}
**Purpose:** Fetch personalized holiday list for employee (adjusted for swap requests).

**Request Parameters:**
- `employeeId` (path parameter, long, required): Employee ID

**Request Example:**
```
GET /api/EmployeeLeave/GetPersonalizedHolidayList/5678
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "message": "Success",
  "result": {
    "india": [
      { "date": "01/26/2025", "name": "Republic Day", "day": "Sunday" },
      { "date": "03/14/2025", "name": "Holi", "day": "Friday" },
      { "date": "08/20/2025", "name": "Swap Holiday", "day": "Wednesday" }
    ],
    "usa": []
  }
}
```

**Implementation Logic:**
1. Fetch base holidays from Downtown API
2. Query accepted swap requests for employee:
   - Subtract workedDate holidays (employee works on these)
   - Add requestedOffDate as new holidays (employee gets off)
3. Sort personalized holidays by date
4. Return adjusted holiday list

**Authorization:** Yes  
**Permissions:** Employee.Read (view own data) or Leave.Admin (view all employees)

---

## Configuration

### appsettings.json
**Location:** `HRMS.API/appsettings.json`

```json
{
  "HttpClientsUrl": {
    "DownTownApiUrl": "https://downtown-api.example.com/api",
    "DownTownApiToken": "your-api-token-here"
  }
}
```

### HttpClient Registration (ConfigureServices.cs)
```csharp
services.AddHttpClient<DownTownClient>("DownTownClient", config =>
{
    config.BaseAddress = new Uri(configuration.HttpClientsUrl.DownTownApiUrl);
    config.DefaultRequestHeaders.Add("apitoken", configuration.HttpClientsUrl.DownTownApiToken);
    config.Timeout = TimeSpan.FromSeconds(60);
});
```

---

## Workflows

### Workflow 1: Employee Views Holiday Calendar on Dashboard
**Actors:** Employee

**Steps:**
1. Employee logs into HRMS
2. Dashboard page loads
3. Frontend calls `GET /api/Dashboard/GetUpcomingHolidayList`
4. DashboardService fetches upcoming holidays from Downtown API
5. API returns holidays for India and USA
6. Dashboard displays "Upcoming Holidays" widget:
   - India holidays shown (if employee country = India)
   - USA holidays shown (if employee country = USA)
7. Widget shows next 3-5 upcoming holidays
8. Employee clicks "View All Holidays"
9. Full calendar modal opens
10. Frontend calls `GET /api/Dashboard/GetHolidayList` for all holidays
11. Calendar component displays all holidays for year
12. Employee can toggle between India and USA calendars
13. Holiday dates highlighted in calendar view
14. Employee clicks holiday date → Shows holiday details (name, day)

**Result:** Employee aware of upcoming holidays for planning leaves and work schedules.

---

### Workflow 2: Employee Applies Leave with Holiday Validation
**Actors:** Employee, System

**Steps:**
1. Employee navigates to "Apply Leave" page
2. Frontend calls `GET /api/EmployeeLeave/GetPersonalizedHolidayList/{employeeId}`
3. System fetches personalized holidays (base holidays + swap adjustments)
4. Employee selects leave type: "Casual Leave"
5. Employee selects start date: Oct 30, 2025
6. Employee selects end date: Nov 05, 2025
7. **Frontend calculates leave days:**
   - Total days: 7 (Oct 30 - Nov 05)
   - Weekends: 2 (Nov 01-02, Sat-Sun)
   - Holidays: 1 (Nov 03, Diwali - from personalized list)
   - Leave days: 4 days
8. **Frontend shows breakdown:**
   ```
   Leave Duration: Oct 30 - Nov 05 (7 days)
   Weekends: 2 days
   Holidays: 1 day (Nov 03 - Diwali)
   Leave Balance to be Deducted: 4 days
   
   ⚠️ Note: Nov 03 is a holiday. Leave will not be deducted for this day.
   ```
9. Employee enters reason: "Family vacation"
10. Employee clicks "Submit"
11. Frontend sends leave application to API
12. Backend validates leave days calculation (same logic)
13. Backend checks leave balance: Available = 10 days, Required = 4 days
14. Leave application approved (sufficient balance)
15. Leave record created with: StartDate, EndDate, TotalDays = 4
16. Leave balance updated: 10 - 4 = 6 days remaining
17. Email notification sent to manager for approval
18. Success message shown: "Leave application submitted successfully"

**Result:** Leave application submitted with accurate leave days calculation excluding holidays and weekends.

---

### Workflow 3: Employee Swaps Holiday and Views Personalized Calendar
**Actors:** Employee, Manager

**Steps:**
1. **Employee requests holiday swap:**
   - Employee navigates to "Swap Holiday" page
   - Employee selects holiday to give up: Aug 15, 2025 (Independence Day)
   - Employee selects working day to take off: Aug 20, 2025
   - Employee enters reason: "Family wedding on Aug 20"
   - Employee submits swap request
   - Manager receives notification
2. **Manager approves swap:**
   - Manager reviews swap request
   - Manager approves request
   - Status updated: Accepted
3. **Employee applies leave after swap:**
   - Employee opens leave application form
   - Frontend calls `GetPersonalizedHolidayList` API
   - **System adjusts holidays:**
     - Base holidays: [Jan 26, Mar 14, Aug 15, Oct 02, Nov 01, Dec 25]
     - Remove: Aug 15 (swapped, now working day)
     - Add: Aug 20 (new holiday from swap)
     - Personalized holidays: [Jan 26, Mar 14, Oct 02, Nov 01, Dec 25, Aug 20]
   - Employee selects leave dates: Aug 14-16
   - **System calculates leave days:**
     - Aug 14 (Wed): Leave day ✓
     - Aug 15 (Thu): Not a holiday in personalized list → Leave day ✓
     - Aug 16 (Fri): Leave day ✓
     - Total leave days: 3 days
   - Employee can apply leave on Aug 15 (swapped holiday)
4. **Later, employee plans leave on Aug 20:**
   - Employee selects Aug 19-21 for leave
   - **System checks personalized holidays:**
     - Aug 19 (Mon): Leave day ✓
     - Aug 20 (Tue): Holiday in personalized list (from swap) → Skipped
     - Aug 21 (Wed): Leave day ✓
   - System shows warning: "Aug 20 is a holiday (Swap Holiday). Leave not required."
   - Total leave days: 2 days (Aug 19, 21)

**Result:** Personalized holiday calendar reflects employee's swap requests, enabling accurate leave planning.

---

## Integration Points

### Integration 1: Dashboard Module
**Purpose:** Display holiday calendar and upcoming holidays widget.

**Data Shared:**
- Upcoming holidays for next 30-60 days
- All holidays for year (India + USA)
- Holiday calendar widget on dashboard home page

**APIs Used:**
- `GET /api/Dashboard/GetHolidayList`
- `GET /api/Dashboard/GetUpcomingHolidayList`

---

### Integration 2: Leave Management Module
**Purpose:** Validate leave dates against holidays, calculate leave days excluding holidays.

**Data Shared:**
- Personalized holiday list per employee
- Holiday swap requests (CompOffAndSwapHolidayDetail table)
- Leave days calculation excludes holidays

**APIs Used:**
- `GET /api/EmployeeLeave/GetPersonalizedHolidayList/{employeeId}`
- `POST /api/EmployeeLeave/ApplySwapHoliday`
- `GET /api/LeaveManagement/GetCompOffAndSwapHolidayDetails`

---

### Integration 3: Attendance Module
**Purpose:** Exclude holidays from working days calculation in attendance reports.

**Data Shared:**
- Holiday dates for attendance report filtering
- Holiday work tracking (worked on holiday → comp-off eligibility)
- Attendance percentage calculation excludes holidays

**Logic:**
```csharp
public decimal CalculateAttendancePercentage(int daysPresent, int totalDays, List<DateTime> holidays, List<DateTime> weekends)
{
    var workingDays = totalDays - weekends.Count - holidays.Count;
    return (daysPresent / (decimal)workingDays) * 100;
}
```

---

### Integration 4: External Downtown API
**Purpose:** Fetch holiday data from external HR system.

**API Endpoints:**
- `GET {DownTownApiUrl}/holidays`: All holidays
- `GET {DownTownApiUrl}/upcomingHolidays`: Upcoming holidays

**Authentication:** API token in HTTP header `apitoken`

**Error Handling:**
- If Downtown API unavailable: Return empty holiday list, log error
- Timeout: 60 seconds
- Retry logic: No automatic retry (fail-fast)

---

## Known Limitations

### 1. No Holiday Caching
**Impact:** Every request fetches holidays from external API, increasing latency.  
**Current Implementation:** Real-time fetch on every API call.  
**Workaround:** None.  
**Future Enhancement:** Implement Redis caching with 24-hour TTL, refresh cache daily.

---

### 2. No Holiday Management UI
**Impact:** Holidays cannot be managed within HRMS, fully dependent on Downtown API.  
**Current Implementation:** All holidays fetched from external system.  
**Workaround:** Update holidays in Downtown system.  
**Future Enhancement:** Add holiday CRUD in HRMS with override capability for external holidays.

---

### 3. Hard-Coded Country Support (India/USA)
**Impact:** Cannot support additional countries without code changes.  
**Current Implementation:** Only India and USA holiday lists supported.  
**Workaround:** None.  
**Future Enhancement:** Dynamic country support with database-driven configuration.

---

### 4. No Holiday Notifications
**Impact:** Employees not notified of upcoming holidays.  
**Current Implementation:** Passive display on dashboard.  
**Workaround:** Employees must check dashboard manually.  
**Future Enhancement:** Email notifications for upcoming holidays (e.g., 7 days before holiday).

---

### 5. Date Format Inconsistency
**Impact:** Downtown API uses MM/DD/YYYY format, HRMS uses YYYY-MM-DD internally.  
**Current Implementation:** Manual parsing and conversion in code.  
**Workaround:** Careful date format handling in all date operations.  
**Future Enhancement:** Standardize date format across all systems.

---

## Summary

**Module 09: Holiday Management** provides centralized holiday calendar management by integrating with external Downtown API, supporting personalized holiday views for employees, and seamless integration with leave management and attendance modules. The module enables accurate leave planning, attendance reporting, and holiday tracking for multi-country operations (India/USA).

### Core Functionalities Delivered:
✅ **External API Integration:** Fetch holidays from Downtown API  
✅ **Multi-Country Support:** India and USA holiday calendars  
✅ **Personalized Holidays:** Adjust holidays based on employee swap requests  
✅ **Dashboard Integration:** Display upcoming holidays widget  
✅ **Leave Validation:** Exclude holidays from leave days calculation  
✅ **Attendance Integration:** Exclude holidays from working days  
✅ **Holiday Swap Support:** Track swapped holidays for personalized calendars  

### Technical Implementation Highlights:
- **DownTownClient:** Named HttpClient for external API calls
- **AutoMapper:** Transform Downtown API response to HRMS DTOs
- **Personalized Holidays:** Dynamic holiday list based on swap requests
- **Date Parsing:** Handle MM/DD/YYYY format from external API
- **Error Handling:** Graceful failure if external API unavailable

### Integration Ecosystem:
- **Dashboard Module:** Holiday calendar display
- **Leave Management:** Holiday validation for leave applications
- **Attendance Module:** Exclude holidays from working days
- **External Downtown API:** Source of truth for holiday data

### Business Value:
- **Accurate Planning:** Employees plan leaves with accurate holiday information
- **Compliance:** Holiday tracking ensures compliance with labor laws
- **Flexibility:** Holiday swap feature provides flexibility for employees
- **Centralized Management:** Single source of truth for holidays (Downtown API)
- **Multi-Country Support:** Handles India and USA locations

### Production Readiness:
✅ DownTownClient implemented with timeout and error handling  
✅ Holiday APIs functional and tested  
✅ Personalized holiday logic implemented  
✅ Integration with Leave and Dashboard modules complete  
⚠️ No caching (performance concern for high traffic)  
⚠️ No holiday CRUD UI (dependent on external system)  
⚠️ No holiday notifications for employees  

### Future Enhancements (Recommended):
1. **Caching:** Redis cache for holiday data (24-hour TTL)
2. **Holiday CRUD:** Internal holiday management with external API override
3. **Dynamic Countries:** Support for additional countries beyond India/USA
4. **Holiday Notifications:** Email/Slack notifications for upcoming holidays
5. **Holiday Types:** Categorize holidays (national, regional, optional, restricted)
6. **Regional Holidays:** Support for state/province-specific holidays
7. **Holiday Calendar Export:** Export holidays to iCal/Google Calendar
8. **Holiday Analytics:** Reports on holiday utilization, working days per quarter

**End of Module 09 Documentation**

**Related Modules:**  
← [Module 08: Leave Management](./08-leave-management.md) *(Holiday validation for leaves)*  
← [Module 03: Attendance Management](./03-attendance-management.md) *(Holiday exclusion in reports)*  
→ [Module 10: Role & Permission Management](./10-role-permission-management.md)
