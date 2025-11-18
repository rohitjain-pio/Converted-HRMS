# Timezone Conversion Fix - November 18, 2025

## Problem Statement
Timezone conversions between UTC and IST were not working correctly. The database was storing IST times instead of UTC, and double conversion was happening when retrieving data.

## Root Causes Identified

### 1. MySQL Session Timezone (CRITICAL)
**Issue**: MySQL was set to `SYSTEM` timezone (IST on the server), causing automatic timezone conversion on storage.

**Solution**: Added `'timezone' => '+00:00'` to MySQL connection config in `config/database.php`

```php
'mysql' => [
    // ... other config
    'timezone' => '+00:00',  // Force UTC for all database operations
],
```

**Impact**: Ensures all TIME values are stored and retrieved in UTC without automatic conversion.

### 2. Eloquent Model Accessors (CRITICAL)
**Issue**: `Attendance` and `AttendanceAudit` models had automatic timezone conversion accessors that converted UTC to IST on every read, causing double conversion when TimezoneHelper was also applied.

**Files Modified**:
- `app/Models/Attendance.php` - Removed `getStartTimeAttribute()`, `getEndTimeAttribute()`, `setStartTimeAttribute()`, `setEndTimeAttribute()`
- `app/Models/AttendanceAudit.php` - Removed `getTimeAttribute()`, `setTimeAttribute()`
- Removed `datetime` casts for time columns

**Reason**: Legacy .NET code explicitly converts times when building response DTOs, not automatically on every model access. This matches that pattern.

### 3. TimeDoctorSyncService Timezone Handling
**Issue**: Carbon was correctly parsing Time Doctor API's UTC times ("2025-11-18T05:59:30.000Z"), but we added explicit UTC timezone setting for clarity.

**Solution**: Added explicit `->setTimezone('UTC')` when formatting times from Time Doctor API response.

```php
$startTimeUtc = $startTime->copy()->setTimezone('UTC')->format('H:i:s');
$endTimeUtc = $endTime->copy()->setTimezone('UTC')->format('H:i:s');
```

## Current Behavior (CORRECT)

### Storage Layer (Database)
- **Format**: TIME columns store HH:MM:SS in UTC
- **Example**: `05:59:30` (UTC time from Time Doctor API)
- **MySQL Session**: Always runs with `time_zone = '+00:00'`

### Service Layer (AttendanceService)
- **Read**: Raw UTC times from database via Eloquent models
- **Convert**: Explicitly via `TimezoneHelper::utcToIst($time)` before sending to API
- **Write**: Explicitly via `TimezoneHelper::istToUtc($time, $date)` when receiving from frontend

### API Response Layer
- **Format**: HH:MM in IST for frontend display
- **Example**: `11:29` (05:59:30 UTC + 5:30 offset = 11:29:30 IST, formatted as 11:29)
- **Conversion**: Done in `formatAttendanceRecord()` method

## Legacy .NET Code Matching

### Time Doctor Sync
**Legacy .NET**:
```csharp
StartTime = stat.Start.TimeOfDay,  // UTC from API, stored as-is
EndTime = stat.End.TimeOfDay       // UTC from API, stored as-is
```

**Migrated PHP** (✓ Matching):
```php
$startTimeUtc = $startTime->copy()->setTimezone('UTC')->format('H:i:s');
$endTimeUtc = $endTime->copy()->setTimezone('UTC')->format('H:i:s');
// Stored directly in UTC TIME columns
```

### Display Conversion
**Legacy .NET**:
```csharp
result.AttendaceReport = ConvertUtcToDiffTimeZone(result.AttendaceReport, "India Standard Time");

// Inside ConvertUtcToDiffTimeZone:
var istStart = TimeZoneInfo.ConvertTimeFromUtc(utcStart, istZone);
attendance.StartTime = istStart.ToString("HH:mm");
```

**Migrated PHP** (✓ Matching):
```php
$startTimeIst = TimezoneHelper::utcToIst($attendance->start_time);
// Returns 'H:i' format in IST
```

### Manual Attendance Entry
**Legacy .NET**:
```csharp
var utcStart = TimeZoneInfo.ConvertTimeToUtc(localStartDateTime, istZone).TimeOfDay;
attendanceRow.StartTime = utcStart.ToString(HoursMinutes);
```

**Migrated PHP** (✓ Matching):
```php
$startTimeUtc = TimezoneHelper::istToUtc($data['startTime'], $data['date']);
// Converts IST input to UTC before storage
```

## Verification Tests

### Test 1: Database Storage
```sql
SELECT start_time, end_time FROM attendance WHERE employee_id = 57 AND date = '2025-11-18';
-- Result: 05:59:30, 07:39:00 (UTC) ✓
```

### Test 2: API Response
```php
$result = $attendanceService->getAttendanceByEmployee(57, '2025-11-18', '2025-11-18', 0, 10);
echo $result['attendaceReport'][0]['startTime'];  // 11:29 (IST) ✓
echo $result['attendaceReport'][0]['endTime'];    // 13:09 (IST) ✓
```

### Test 3: Audit Trail
```php
$result['attendaceReport'][0]['audit'][0]['time'];  // 11:29 (IST) ✓
$result['attendaceReport'][0]['audit'][1]['time'];  // 13:09 (IST) ✓
```

## Files Modified

1. **config/database.php** - Added MySQL timezone setting
2. **app/Models/Attendance.php** - Removed automatic timezone conversions
3. **app/Models/AttendanceAudit.php** - Removed automatic timezone conversions
4. **app/Services/TimeDoctorSyncService.php** - Added explicit UTC timezone handling

## Critical Points for Future Development

1. **Never add timezone conversion accessors to models** - All conversions must be explicit at the service layer
2. **TimezoneHelper is the single source of truth** for timezone conversions
3. **Database always stores UTC** in TIME columns
4. **MySQL session timezone must always be UTC** (`+00:00`)
5. **Frontend receives IST times** - API layer handles conversion
6. **Manual entry from frontend** - Service layer converts IST → UTC before storage

## Testing Checklist

- [✓] Time Doctor sync stores UTC times correctly
- [✓] API returns IST times for display
- [✓] Audit trail times match main times (no double conversion)
- [✓] Manual attendance entry converts IST → UTC
- [✓] Employee report shows IST times
- [✓] Database queries return UTC times
- [✓] MySQL session timezone is +00:00

## Performance Impact
- **Minimal** - Removed unnecessary timezone conversions on every model access
- **Improved** - Timezone conversion only happens when formatting API responses

## Rollback Plan
If issues arise, revert these commits:
1. `config/database.php` - Remove timezone setting
2. `app/Models/Attendance.php` - Restore accessors (but this will cause double conversion again)
3. `app/Models/AttendanceAudit.php` - Restore accessors (but this will cause double conversion again)
