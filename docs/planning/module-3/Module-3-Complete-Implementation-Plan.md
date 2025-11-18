# Module 3 — Attendance Management Complete Implementation Plan

**Version:** v1.0.0  
**Date:** November 13, 2025  
**Migration Type:** React + .NET → Vue.js + Laravel  
**Author:** AI Migration Assistant  

---

## 📋 Module Overview

**Purpose:**  
The Attendance Management module provides comprehensive time tracking for employees through dual modes: automatic Time Doctor integration and manual attendance entry. It maintains complete attendance records including work hours, time in/out, location tracking, and audit trails for HR compliance and payroll processing.

**Core Functionalities:**
- **Manual Attendance Entry:** Employee self-service time in/out logging
- **Automatic Time Doctor Sync:** Background sync from Time Doctor API 
- **Attendance Configuration:** HR management of employee tracking modes
- **Attendance Reports:** Comprehensive reporting and Excel exports
- **Audit Trail Management:** Complete tracking of attendance actions
- **Timezone Handling:** Proper IST/UTC conversion for global operations

**Dependencies:**
- **Employee Management Module:** Employee data, department/team relationships
- **Role & Permission System:** Attendance.Create, Attendance.Read, Attendance.Edit permissions
- **Time Doctor API:** External time tracking integration
- **Background Jobs:** Scheduled daily sync operations

**Version & Changelog:**  
- v1.0.0: Initial complete implementation plan for Module 3 migration
- Verified schema, API endpoints, React components, and business logic per documentation

---

## ✅ Verification Checklist

**Completed Analysis:**
- [x] **Database Schema Verified:** Attendance, AttendanceAudit, AttendanceConfig tables in `02_HRMS_Table_Scripts.sql`
- [x] **Backend API Mapped:** 9 .NET endpoints in AttendanceController with all CRUD operations
- [x] **Frontend Components Analyzed:** React components in `Legacy-Folder/Frontend/HRMS-Frontend/source/src/pages/Attendance/`
- [x] **UI/UX Documentation Reviewed:** Component hierarchy and interaction patterns documented
- [x] **Time Doctor Integration Confirmed:** Background job, API client, and automatic sync workflows
- [x] **Permission System Validated:** Attendance.Create, Attendance.Edit, Attendance.Read permissions mapped

---

## 🔧 Backend Migration Plan (Laravel)

### 1. Database Migration Files

#### Primary Tables Migration
```php
<?php
// database/migrations/2024_11_13_000001_create_attendance_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->date('date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('day', 50)->nullable();
            $table->string('attendance_type', 100)->nullable();
            $table->string('total_hours', 50)->nullable();
            $table->string('location', 255)->nullable();
            $table->timestamp('created_on')->nullable();
            $table->string('created_by', 255)->nullable();
            $table->string('modified_by', 255)->nullable();
            $table->timestamp('modified_on')->nullable();
            
            $table->foreign('employee_id')->references('id')->on('employee_data');
            $table->index(['employee_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance');
    }
};
```

```php
<?php
// database/migrations/2024_11_13_000002_create_attendance_audit_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_audit', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('attendance_id');
            $table->string('action', 255)->nullable();
            $table->string('time', 255)->nullable();
            $table->text('comment')->nullable();
            $table->text('reason')->nullable();
            
            $table->foreign('attendance_id')->references('id')->on('attendance');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_audit');
    }
};
```

### 2. Laravel Eloquent Models

#### Attendance Model
```php
<?php
// app/Models/Attendance.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';
    public $timestamps = false;

    protected $fillable = [
        'employee_id', 'date', 'start_time', 'end_time', 'day',
        'attendance_type', 'total_hours', 'location', 'created_on',
        'created_by', 'modified_by', 'modified_on'
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
        'created_on' => 'datetime',
        'modified_on' => 'datetime'
    ];

    // Relationships
    public function employee()
    {
        return $this->belongsTo(EmployeeData::class, 'employee_id');
    }

    public function audits()
    {
        return $this->hasMany(AttendanceAudit::class);
    }

    // Scopes
    public function scopeForEmployee($query, $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    // Mutators & Accessors
    public function setStartTimeAttribute($value)
    {
        $this->attributes['start_time'] = $value ? Carbon::parse($value)->utc()->format('H:i:s') : null;
    }

    public function setEndTimeAttribute($value)
    {
        $this->attributes['end_time'] = $value ? Carbon::parse($value)->utc()->format('H:i:s') : null;
    }

    public function getStartTimeAttribute($value)
    {
        return $value ? Carbon::parse($value)->timezone('Asia/Kolkata')->format('H:i') : null;
    }

    public function getEndTimeAttribute($value)
    {
        return $value ? Carbon::parse($value)->timezone('Asia/Kolkata')->format('H:i') : null;
    }
}
```

#### AttendanceAudit Model
```php
<?php
// app/Models/AttendanceAudit.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceAudit extends Model
{
    protected $table = 'attendance_audit';
    public $timestamps = false;

    protected $fillable = [
        'attendance_id', 'action', 'time', 'comment', 'reason'
    ];

    public function attendance()
    {
        return $this->belongsTo(Attendance::class);
    }
}
```

### 3. Laravel Controller Implementation

#### AttendanceController
```php
<?php
// app/Http/Controllers/AttendanceController.php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Services\AttendanceService;
use App\Services\TimeDoctorService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    protected $attendanceService;
    protected $timeDoctorService;

    public function __construct(
        AttendanceService $attendanceService,
        TimeDoctorService $timeDoctorService
    ) {
        $this->attendanceService = $attendanceService;
        $this->timeDoctorService = $timeDoctorService;
    }

    /**
     * Add daily attendance record
     * POST /api/attendance/add-attendance/{employeeId}
     */
    public function addAttendance(Request $request, $employeeId)
    {
        $validated = $request->validate([
            'date' => 'required|date|before_or_equal:today',
            'startTime' => 'nullable|date_format:H:i',
            'endTime' => 'nullable|date_format:H:i|after:startTime',
            'location' => 'required|string|max:255',
            'attendanceType' => 'string|max:100',
            'audit' => 'array'
        ]);

        try {
            $result = $this->attendanceService->addAttendance($employeeId, $validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Attendance added successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get attendance records for employee with pagination
     * GET /api/attendance/get-attendance/{employeeId}
     */
    public function getAttendance(Request $request, $employeeId)
    {
        $dateFrom = $request->query('dateFrom', Carbon::now()->startOfWeek()->toDateString());
        $dateTo = $request->query('dateTo', Carbon::now()->endOfWeek()->toDateString());
        $pageIndex = $request->query('pageIndex', 0);
        $pageSize = $request->query('pageSize', 7);

        try {
            $result = $this->attendanceService->getAttendance(
                $employeeId, $dateFrom, $dateTo, $pageIndex, $pageSize
            );
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update existing attendance record
     * PUT /api/attendance/update-attendance/{employeeId}/{attendanceId}
     */
    public function updateAttendance(Request $request, $employeeId, $attendanceId)
    {
        $validated = $request->validate([
            'date' => 'required|date|before_or_equal:today',
            'startTime' => 'nullable|date_format:H:i',
            'endTime' => 'nullable|date_format:H:i|after:startTime',
            'location' => 'required|string|max:255',
            'audit' => 'array'
        ]);

        try {
            $result = $this->attendanceService->updateAttendance(
                $employeeId, $attendanceId, $validated
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Attendance updated successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Toggle attendance configuration (Manual/Automatic)
     * PUT /api/attendance/update-config
     */
    public function updateConfig(Request $request)
    {
        $validated = $request->validate([
            'employeeId' => 'required|integer|exists:employee_data,id'
        ]);

        try {
            $result = $this->attendanceService->toggleAttendanceConfig(
                $validated['employeeId']
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Attendance configuration updated successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get attendance configuration list (Admin)
     * POST /api/attendance/get-attendance-config-list
     */
    public function getAttendanceConfigList(Request $request)
    {
        $validated = $request->validate([
            'pageIndex' => 'integer|min:0',
            'pageSize' => 'integer|min:1|max:100',
            'employeeCode' => 'nullable|string',
            'employeeName' => 'nullable|string',
            'departmentId' => 'nullable|integer',
            'teamId' => 'nullable|integer',
            'isManualAttendance' => 'nullable|boolean'
        ]);

        try {
            $result = $this->attendanceService->getAttendanceConfigList($validated);
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get employee attendance report (Manager/HR)
     * POST /api/attendance/get-employee-report
     */
    public function getEmployeeReport(Request $request)
    {
        $validated = $request->validate([
            'pageIndex' => 'integer|min:0',
            'pageSize' => 'integer|min:1|max:100',
            'employeeCode' => 'nullable|string',
            'dateFrom' => 'nullable|date',
            'dateTo' => 'nullable|date|after_or_equal:dateFrom',
            'departmentId' => 'nullable|integer',
            'isManualAttendance' => 'nullable|boolean'
        ]);

        try {
            $result = $this->attendanceService->getEmployeeReport($validated);
            
            return response()->json([
                'success' => true,
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Export attendance report to Excel
     * POST /api/attendance/export-employee-report-excel
     */
    public function exportEmployeeReportExcel(Request $request)
    {
        $validated = $request->validate([
            'employeeCode' => 'nullable|string',
            'dateFrom' => 'nullable|date',
            'dateTo' => 'nullable|date|after_or_equal:dateFrom',
            'departmentId' => 'nullable|integer'
        ]);

        try {
            $excelFile = $this->attendanceService->exportEmployeeReportExcel($validated);
            
            return response()->download($excelFile['path'], $excelFile['filename'])
                ->deleteFileAfterSend();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Manually trigger Time Doctor sync job
     * POST /api/attendance/trigger-timesheet-sync
     */
    public function triggerTimeDoctorSync(Request $request)
    {
        $validated = $request->validate([
            'forDate' => 'required|date'
        ]);

        try {
            $result = $this->timeDoctorService->triggerManualSync($validated['forDate']);
            
            return response()->json([
                'success' => true,
                'message' => 'Time Doctor sync job triggered successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
```

### 4. Laravel API Routes

```php
<?php
// routes/api.php - Attendance Management Routes

use App\Http\Controllers\AttendanceController;

Route::middleware('auth:sanctum')->prefix('attendance')->group(function () {
    // Employee Attendance CRUD
    Route::post('add-attendance/{employeeId}', [AttendanceController::class, 'addAttendance'])
        ->middleware('permission:attendance.create');
        
    Route::get('get-attendance/{employeeId}', [AttendanceController::class, 'getAttendance'])
        ->middleware('permission:attendance.read');
        
    Route::put('update-attendance/{employeeId}/{attendanceId}', [AttendanceController::class, 'updateAttendance'])
        ->middleware('permission:attendance.edit');
    
    // Configuration Management
    Route::put('update-config', [AttendanceController::class, 'updateConfig'])
        ->middleware('permission:attendance.admin');
        
    Route::post('get-attendance-config-list', [AttendanceController::class, 'getAttendanceConfigList'])
        ->middleware('permission:attendance.admin');
    
    // Reporting
    Route::post('get-employee-report', [AttendanceController::class, 'getEmployeeReport'])
        ->middleware('permission:attendance.report');
        
    Route::post('export-employee-report-excel', [AttendanceController::class, 'exportEmployeeReportExcel'])
        ->middleware('permission:attendance.export');
    
    // Time Doctor Integration
    Route::post('trigger-timesheet-sync', [AttendanceController::class, 'triggerTimeDoctorSync'])
        ->middleware('permission:attendance.admin');
});
```

---

## 🎨 Frontend Migration Plan (Vue.js)

### 1. React to Vue.js Component Mapping

| React Component | Vue Equivalent | Description | Migration Priority |
|-----------------|----------------|-------------|-------------------|
| `Attendance/Employee/index.tsx` | `AttendanceEmployee.vue` | Main attendance page container | High |
| `AttendanceTable/index.tsx` | `AttendanceTable.vue` | Data table with pagination | High |
| `TimeInDialog.tsx` | `TimeInDialog.vue` | Time entry modal form | High |
| `TimeOutDialog.tsx` | `TimeOutDialog.vue` | Time out confirmation modal | Medium |
| `AttendanceFilter.tsx` | `AttendanceFilter.vue` | Date range filter component | Medium |
| `useAttendanceDialogs` | `useAttendanceDialogs.js` | Composable for dialog state | High |

### 2. Vue.js Implementation Strategy

#### Main Attendance Page Container
```vue
<!-- src/pages/attendance/AttendanceEmployee.vue -->
<template>
  <div class="attendance-page">
    <v-breadcrumbs :items="breadcrumbItems" />
    
    <v-card elevation="3">
      <v-card-title>
        <PageHeader title="My Attendance" />
      </v-card-title>
      
      <AttendanceTable
        :records="attendanceRecords"
        :total-records="totalRecords"
        :loading="loading"
        :is-manual-attendance="isManualAttendance"
        :show-time-in-button="showTimeInButton"
        :pagination="pagination"
        @update:pagination="pagination = $event"
        @time-in="openTimeInDialog"
        @edit="handleEdit"
        @time-out="openTimeOutDialog"
        @filter="handleFilter"
      />
    </v-card>

    <!-- Dialogs -->
    <TimeInDialog
      v-model="timeInDialog.open"
      :edit-data="timeInDialog.editData"
      :filled-dates="filledDates"
      :loading="timeInDialog.loading"
      @submit="handleTimeIn"
    />
    
    <TimeOutDialog
      v-model="timeOutDialog.open"
      :current-time="currentTime"
      :loading="timeOutDialog.loading"
      @confirm="handleTimeOut"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAttendanceStore } from '@/stores/attendance'
import { useAttendanceDialogs } from '@/composables/useAttendanceDialogs'
import AttendanceTable from '@/components/attendance/AttendanceTable.vue'
import TimeInDialog from '@/components/attendance/TimeInDialog.vue'
import TimeOutDialog from '@/components/attendance/TimeOutDialog.vue'

// Composables and stores
const attendanceStore = useAttendanceStore()
const { 
  timeInDialog, 
  timeOutDialog,
  handleTimeIn, 
  handleTimeOut, 
  handleEdit,
  openTimeInDialog,
  openTimeOutDialog,
  currentTime,
  showTimeInButton
} = useAttendanceDialogs()

// Reactive data
const pagination = reactive({
  page: 1,
  itemsPerPage: 7,
  sortBy: [{ key: 'date', order: 'desc' }]
})

const loading = ref(false)

// Computed properties
const breadcrumbItems = computed(() => [
  { title: 'Dashboard', to: '/dashboard' },
  { title: 'My Attendance', disabled: true }
])

const attendanceRecords = computed(() => attendanceStore.attendanceRecords)
const totalRecords = computed(() => attendanceStore.totalRecords)
const isManualAttendance = computed(() => attendanceStore.isManualAttendance)
const filledDates = computed(() => attendanceStore.filledDates)

// Methods
const handleTimeInButton = () => {
  timeInDialog.editData = {
    id: 0,
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    note: '',
    reason: '',
    totalHours: ''
  }
  timeInDialog.open = true
}

const handleFilter = (filters: any) => {
  attendanceStore.fetchAttendanceRecords(filters)
}

// Lifecycle
onMounted(() => {
  attendanceStore.fetchCurrentWeekAttendance()
})
</script>

<style scoped lang="scss">
.attendance-page {
  padding: 24px;
}
</style>
```

#### Attendance Data Table Component
```vue
<!-- src/components/attendance/AttendanceTable.vue -->
<template>
  <v-data-table
    :headers="tableHeaders"
    :items="records"
    :items-per-page="pagination.itemsPerPage"
    :page="pagination.page"
    :server-items-length="totalRecords"
    :loading="loading"
    :sort-by="pagination.sortBy"
    class="elevation-1"
    @update:options="handlePaginationUpdate"
  >
    <!-- Top toolbar slot -->
    <template #top>
      <v-toolbar flat>
        <AttendanceFilter 
          @filter="$emit('filter', $event)"
        />
        
        <v-spacer />
        
        <v-btn
          v-if="isManualAttendance && showTimeInButton"
          color="primary"
          @click="$emit('time-in')"
        >
          <v-icon left>mdi-clock-time-four-outline</v-icon>
          Time In
        </v-btn>
      </v-toolbar>
    </template>

    <!-- Date column -->
    <template #item.date="{ item }">
      <span class="font-weight-medium">
        {{ formatDate(item.date) }}
      </span>
      <br>
      <span class="text-caption text-grey">
        {{ item.day }}
      </span>
    </template>

    <!-- Start time column -->
    <template #item.startTime="{ item }">
      <v-chip
        v-if="item.startTime"
        size="small"
        color="success"
        variant="outlined"
      >
        {{ item.startTime }}
      </v-chip>
      <span v-else class="text-grey">—</span>
    </template>

    <!-- End time column -->
    <template #item.endTime="{ item }">
      <v-chip
        v-if="item.endTime"
        size="small"
        color="error"
        variant="outlined"
      >
        {{ item.endTime }}
      </v-chip>
      <span v-else class="text-grey">—</span>
    </template>

    <!-- Total hours column -->
    <template #item.totalHours="{ item }">
      <span class="font-weight-medium">
        {{ item.totalHours || '00:00' }}
      </span>
    </template>

    <!-- Location column -->
    <template #item.location="{ item }">
      <v-chip
        size="small"
        variant="tonal"
        :color="getLocationColor(item.location)"
      >
        {{ item.location || 'Not specified' }}
      </v-chip>
    </template>

    <!-- Actions column -->
    <template #item.actions="{ item }">
      <v-btn
        v-if="isManualAttendance"
        icon="mdi-pencil"
        size="small"
        variant="text"
        @click="$emit('edit', item)"
      />
      
      <v-btn
        v-if="isManualAttendance && isToday(item.date) && !item.endTime"
        icon="mdi-clock-time-eight-outline"
        size="small"
        variant="text"
        color="error"
        @click="$emit('time-out', item)"
      />
    </template>

    <!-- Empty state -->
    <template #no-data>
      <div class="text-center py-8">
        <v-icon size="64" color="grey-lighten-2">
          mdi-calendar-clock
        </v-icon>
        <p class="text-h6 text-grey mt-2">
          No attendance records found
        </p>
        <p class="text-body-2 text-grey">
          Start by adding your first attendance entry
        </p>
      </div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format, isToday as checkIsToday } from 'date-fns'
import AttendanceFilter from './AttendanceFilter.vue'

// Props
interface Props {
  records: any[]
  totalRecords: number
  loading: boolean
  isManualAttendance: boolean
  showTimeInButton: boolean
  pagination: {
    page: number
    itemsPerPage: number
    sortBy: any[]
  }
}

const props = withDefaults(defineProps<Props>(), {
  records: () => [],
  totalRecords: 0,
  loading: false,
  isManualAttendance: true,
  showTimeInButton: false
})

// Emits
const emit = defineEmits<{
  'update:pagination': [value: any]
  'filter': [value: any]
  'time-in': []
  'edit': [item: any]
  'time-out': [item: any]
}>()

// Computed
const tableHeaders = computed(() => [
  {
    title: 'Date',
    align: 'start',
    sortable: true,
    key: 'date',
    width: '150px'
  },
  {
    title: 'Time In',
    align: 'center',
    sortable: false,
    key: 'startTime',
    width: '120px'
  },
  {
    title: 'Time Out',
    align: 'center',
    sortable: false,
    key: 'endTime',
    width: '120px'
  },
  {
    title: 'Total Hours',
    align: 'center',
    sortable: false,
    key: 'totalHours',
    width: '120px'
  },
  {
    title: 'Location',
    align: 'center',
    sortable: false,
    key: 'location',
    width: '150px'
  },
  {
    title: 'Actions',
    align: 'center',
    sortable: false,
    key: 'actions',
    width: '100px'
  }
])

// Methods
const handlePaginationUpdate = (options: any) => {
  emit('update:pagination', {
    page: options.page,
    itemsPerPage: options.itemsPerPage,
    sortBy: options.sortBy
  })
}

const formatDate = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

const isToday = (date: string) => {
  return checkIsToday(new Date(date))
}

const getLocationColor = (location: string) => {
  const colorMap: Record<string, string> = {
    'Jaipur Office': 'blue',
    'Hyderabad Office': 'green',
    'Pune Office': 'purple',
    'Remote': 'orange',
    'On Premises': 'teal'
  }
  return colorMap[location] || 'grey'
}
</script>

<style scoped lang="scss">
:deep(.v-data-table-header) {
  background-color: #f5f5f5;
}

:deep(.v-data-table__td) {
  border-bottom: 1px solid #e0e0e0 !important;
}
</style>
```

### 3. State Management with Pinia

#### Attendance Store
```typescript
// src/stores/attendance.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { attendanceApi } from '@/services/attendanceApi'
import type { 
  AttendanceRecord, 
  AttendanceRequest,
  AttendanceResponse 
} from '@/types/attendance'

export const useAttendanceStore = defineStore('attendance', () => {
  // State
  const attendanceRecords = ref<AttendanceRecord[]>([])
  const totalRecords = ref(0)
  const isManualAttendance = ref(true)
  const isTimedIn = ref(false)
  const filledDates = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const currentWeekRecords = computed(() => {
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
    
    return attendanceRecords.value.filter(record => {
      const recordDate = new Date(record.date)
      return recordDate >= startOfWeek && recordDate <= endOfWeek
    })
  })

  const todayRecord = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return attendanceRecords.value.find(record => record.date === today)
  })

  // Actions
  const fetchAttendanceRecords = async (params: {
    employeeId: number
    dateFrom?: string
    dateTo?: string
    pageIndex?: number
    pageSize?: number
  }) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await attendanceApi.getAttendance(params.employeeId, params)
      
      attendanceRecords.value = response.data.attendanceReport || []
      totalRecords.value = response.data.totalRecords || 0
      isManualAttendance.value = response.data.isManualAttendance
      isTimedIn.value = response.data.isTimedIn
      filledDates.value = response.data.dates || []
      
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch attendance records'
      console.error('Error fetching attendance:', err)
    } finally {
      loading.value = false
    }
  }

  const addAttendance = async (employeeId: number, data: AttendanceRequest) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await attendanceApi.addAttendance(employeeId, data)
      
      // Refresh records after successful add
      await fetchCurrentWeekAttendance(employeeId)
      
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to add attendance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAttendance = async (
    employeeId: number,
    attendanceId: number,
    data: AttendanceRequest
  ) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await attendanceApi.updateAttendance(employeeId, attendanceId, data)
      
      // Refresh records after successful update
      await fetchCurrentWeekAttendance(employeeId)
      
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to update attendance'
      throw err
    } finally {
      loading.value = false
    }
  }

  const toggleAttendanceConfig = async (employeeId: number) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await attendanceApi.updateConfig(employeeId)
      
      // Update local state
      isManualAttendance.value = !isManualAttendance.value
      
      return response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to update attendance configuration'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCurrentWeekAttendance = async (employeeId?: number) => {
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
    
    await fetchAttendanceRecords({
      employeeId: employeeId || 1, // Get from auth store
      dateFrom: startOfWeek.toISOString().split('T')[0],
      dateTo: endOfWeek.toISOString().split('T')[0],
      pageIndex: 0,
      pageSize: 7
    })
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    attendanceRecords.value = []
    totalRecords.value = 0
    isManualAttendance.value = true
    isTimedIn.value = false
    filledDates.value = []
    loading.value = false
    error.value = null
  }

  return {
    // State
    attendanceRecords,
    totalRecords,
    isManualAttendance,
    isTimedIn,
    filledDates,
    loading,
    error,
    
    // Getters
    currentWeekRecords,
    todayRecord,
    
    // Actions
    fetchAttendanceRecords,
    addAttendance,
    updateAttendance,
    toggleAttendanceConfig,
    fetchCurrentWeekAttendance,
    clearError,
    reset
  }
})
```

### 4. API Integration Layer

#### Attendance API Service
```typescript
// src/services/attendanceApi.ts
import { api } from '@/services/api'
import type { 
  AttendanceParams, 
  AttendanceResponse,
  AttendanceRequest,
  AttendanceConfigRequest 
} from '@/types/attendance'

export const attendanceApi = {
  /**
   * Get attendance records for employee
   */
  async getAttendance(
    employeeId: number, 
    params: AttendanceParams
  ): Promise<{ data: AttendanceResponse }> {
    const response = await api.get(`/attendance/get-attendance/${employeeId}`, {
      params
    })
    return response.data
  },

  /**
   * Add new attendance record
   */
  async addAttendance(
    employeeId: number, 
    data: AttendanceRequest
  ): Promise<{ data: any }> {
    const response = await api.post(`/attendance/add-attendance/${employeeId}`, data)
    return response.data
  },

  /**
   * Update existing attendance record
   */
  async updateAttendance(
    employeeId: number,
    attendanceId: number,
    data: AttendanceRequest
  ): Promise<{ data: any }> {
    const response = await api.put(
      `/attendance/update-attendance/${employeeId}/${attendanceId}`, 
      data
    )
    return response.data
  },

  /**
   * Toggle attendance configuration (Manual/Automatic)
   */
  async updateConfig(employeeId: number): Promise<{ data: any }> {
    const response = await api.put('/attendance/update-config', {
      employeeId
    })
    return response.data
  },

  /**
   * Get attendance configuration list (Admin)
   */
  async getAttendanceConfigList(
    filters: any
  ): Promise<{ data: any }> {
    const response = await api.post('/attendance/get-attendance-config-list', filters)
    return response.data
  },

  /**
   * Get employee attendance report (Manager/HR)
   */
  async getEmployeeReport(filters: any): Promise<{ data: any }> {
    const response = await api.post('/attendance/get-employee-report', filters)
    return response.data
  },

  /**
   * Export attendance report to Excel
   */
  async exportEmployeeReportExcel(filters: any): Promise<Blob> {
    const response = await api.post('/attendance/export-employee-report-excel', filters, {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Get employee list for dropdowns
   */
  async getEmployeeCodeAndNameList(
    employeeCode?: string,
    employeeName?: string,
    exEmployee: boolean = false
  ): Promise<{ data: any }> {
    const response = await api.get('/attendance/get-employee-code-and-name-list', {
      params: { employeeCode, employeeName, exEmployee }
    })
    return response.data
  },

  /**
   * Trigger Time Doctor sync job manually
   */
  async triggerTimeDoctorSync(forDate: string): Promise<{ data: any }> {
    const response = await api.post('/attendance/trigger-timesheet-sync', {
      forDate
    })
    return response.data
  }
}
```

---

## 🗄️ Database Migration Plan

### 1. Schema Analysis from Legacy SQL
**Tables Identified:**
- **`Attendance`**: Main attendance records with employee linking
- **`AttendanceAudit`**: Audit trail for attendance actions
- **`EmploymentDetail`**: Contains `IsManualAttendance` flag

### 2. Laravel Migration Compatibility
**Key Changes Required:**
- Convert SQL Server `BIGINT IDENTITY` → Laravel `id()` method
- Map `DATETIME` → Laravel `timestamp()` 
- Convert `VARCHAR` sizes → Laravel `string(length)`
- Preserve foreign key relationships exactly as-is

### 3. Data Seeding Strategy
```php
<?php
// database/seeders/AttendanceSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Attendance;
use App\Models\AttendanceAudit;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
    public function run(): void
    {
        // Seed attendance types
        $attendanceTypes = ['Manual', 'TimeDoctor'];
        
        // Seed location options
        $locations = [
            'Jaipur Office',
            'Hyderabad Office', 
            'Pune Office',
            'Remote',
            'On Premises',
            'US'
        ];

        // Create sample attendance records for testing
        for ($i = 0; $i < 10; $i++) {
            $attendance = Attendance::create([
                'employee_id' => 1,
                'date' => Carbon::now()->subDays(rand(0, 30)),
                'start_time' => '09:00',
                'end_time' => '18:00',
                'day' => Carbon::now()->subDays(rand(0, 30))->format('l'),
                'attendance_type' => $attendanceTypes[array_rand($attendanceTypes)],
                'total_hours' => '09:00',
                'location' => $locations[array_rand($locations)],
                'created_on' => now(),
                'created_by' => 'system'
            ]);

            // Create audit entries
            AttendanceAudit::create([
                'attendance_id' => $attendance->id,
                'action' => 'Time In',
                'time' => '09:00',
                'comment' => 'Started work',
                'reason' => null
            ]);

            AttendanceAudit::create([
                'attendance_id' => $attendance->id,
                'action' => 'Time Out',
                'time' => '18:00',
                'comment' => 'End of work day',
                'reason' => null
            ]);
        }
    }
}
```

---

## 🧪 Testing and Verification

### 1. Backend Testing (Laravel PHPUnit)
```php
<?php
// tests/Feature/AttendanceTest.php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Attendance;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_add_attendance()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)
            ->postJson('/api/attendance/add-attendance/1', [
                'date' => '2025-11-13',
                'startTime' => '09:00',
                'endTime' => '18:00',
                'location' => 'Jaipur Office',
                'attendanceType' => 'Manual'
            ]);

        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }

    public function test_cannot_add_future_date_attendance()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)
            ->postJson('/api/attendance/add-attendance/1', [
                'date' => now()->addDays(1)->format('Y-m-d'),
                'startTime' => '09:00',
                'location' => 'Jaipur Office'
            ]);

        $response->assertStatus(422);
    }

    public function test_attendance_timezone_conversion()
    {
        $user = User::factory()->create();
        
        $attendance = Attendance::create([
            'employee_id' => 1,
            'date' => '2025-11-13',
            'start_time' => '09:00', // IST input
            'end_time' => '18:00',   // IST input
            'location' => 'Jaipur Office'
        ]);

        // Verify UTC storage and IST retrieval
        $this->assertEquals('09:00', $attendance->start_time); // Should convert back to IST
    }
}
```

### 2. Frontend Testing (Playwright)
```typescript
// tests/attendance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Attendance Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/attendance/my-attendance')
    await page.waitForLoadState('networkidle')
  })

  test('should display attendance table', async ({ page }) => {
    await expect(page.locator('[data-testid="attendance-table"]')).toBeVisible()
    await expect(page.locator('text=My Attendance')).toBeVisible()
  })

  test('should open time-in dialog when clicked', async ({ page }) => {
    await page.click('[data-testid="time-in-button"]')
    await expect(page.locator('[data-testid="time-in-dialog"]')).toBeVisible()
  })

  test('should add attendance successfully', async ({ page }) => {
    await page.click('[data-testid="time-in-button"]')
    
    await page.fill('[data-testid="date-picker"]', '2025-11-13')
    await page.selectOption('[data-testid="location-select"]', 'Jaipur Office')
    await page.fill('[data-testid="start-time"]', '09:00')
    await page.fill('[data-testid="end-time"]', '18:00')
    
    await page.click('[data-testid="save-attendance"]')
    
    await expect(page.locator('text=Attendance added successfully')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-testid="time-in-button"]')
    await page.click('[data-testid="save-attendance"]')
    
    await expect(page.locator('text=Date is required')).toBeVisible()
    await expect(page.locator('text=Location is required')).toBeVisible()
  })
})
```

---

## ⚠️ Risks and Mitigations

| Risk | Impact | Mitigation |
|------|---------|------------|
| **Timezone Conversion Issues** | High | Implement comprehensive UTC/IST conversion testing |
| **API Response Format Changes** | Medium | Create response transformers to maintain consistency |
| **Permission System Integration** | High | Map .NET permissions exactly to Laravel middleware |
| **Time Doctor API Dependencies** | Medium | Implement fallback mechanisms and proper error handling |
| **Vue.js Component State Management** | Medium | Use Pinia stores with proper reactivity patterns |
| **Database Schema Mismatch** | High | Validate all migrations against legacy SQL schema |

---

## 📅 Implementation Timeline

| Phase | Task | Type | Duration (hrs) | Dependency |
|--------|------|------|----------------|-------------|
| 1 | **Backend Setup** | Laravel | 6 | Database Schema |
| 1.1 | Create migrations and models | Backend | 2 | - |
| 1.2 | Implement AttendanceController | Backend | 3 | Models |
| 1.3 | Setup API routes and middleware | Backend | 1 | Controller |
| 2 | **Frontend Setup** | Vue.js | 8 | Backend API |
| 2.1 | Create Vue components | Frontend | 4 | UI Design |
| 2.2 | Implement Pinia stores | Frontend | 2 | Components |
| 2.3 | Setup API integration layer | Frontend | 2 | Backend |
| 3 | **Integration Testing** | Full-stack | 4 | Phase 1+2 |
| 3.1 | Backend unit tests | Testing | 2 | Backend |
| 3.2 | Frontend component tests | Testing | 1 | Frontend |
| 3.3 | End-to-end Playwright tests | Testing | 1 | Integration |
| 4 | **Time Doctor Integration** | External | 3 | Backend |
| 4.1 | Implement TimeDoctorService | Backend | 2 | Laravel Jobs |
| 4.2 | Setup background sync jobs | Backend | 1 | Service |
| 5 | **Final Validation** | QA | 2 | All Phases |

**Total Estimated Time: 23 hours**

---

## 🚀 Deliverables Summary

| Output File | Description | Status |
|--------------|-------------|---------|
| **Backend Files** |  |  |
| `database/migrations/*_create_attendance_*.php` | Laravel migration files | ✅ Planned |
| `app/Models/Attendance.php` | Eloquent model with relationships | ✅ Planned |
| `app/Http/Controllers/AttendanceController.php` | API controller with all endpoints | ✅ Planned |
| `routes/api.php` | API route definitions | ✅ Planned |
| **Frontend Files** |  |  |
| `src/pages/attendance/AttendanceEmployee.vue` | Main attendance page | ✅ Planned |
| `src/components/attendance/AttendanceTable.vue` | Data table component | ✅ Planned |
| `src/components/attendance/TimeInDialog.vue` | Time entry modal | ✅ Planned |
| `src/stores/attendance.ts` | Pinia store for state management | ✅ Planned |
| `src/services/attendanceApi.ts` | API integration layer | ✅ Planned |
| **Testing Files** |  |  |
| `tests/Feature/AttendanceTest.php` | Laravel PHPUnit tests | ✅ Planned |
| `tests/attendance.spec.ts` | Playwright E2E tests | ✅ Planned |

---

## 📋 Next Steps

1. **Start Backend Implementation:**
   - Create Laravel migrations for Attendance tables
   - Implement Eloquent models with proper relationships
   - Build AttendanceController with all API endpoints

2. **Frontend Development:**
   - Create Vue.js components following the mapping plan
   - Implement Pinia stores for state management
   - Setup API integration layer

3. **Testing & Validation:**
   - Write comprehensive unit tests for backend logic
   - Create Playwright tests for UI interactions
   - Test timezone conversion thoroughly

4. **Integration & Deployment:**
   - Integrate with existing authentication system
   - Setup permission middleware correctly
   - Deploy and validate in staging environment

---

**End of Implementation Plan - Ready for Execution** ✅
