# Module 3 — Attendance Management Migration Plan (Part 2)

**Version:** v1.0.0  
**Date:** November 13, 2025  
**Migration Type:** React + .NET → Vue.js + Laravel  

---

## 🔧 Backend Migration Plan (Laravel) - Continued

### 3. Laravel Controller Implementation

#### AttendanceController Complete Implementation
```php
<?php
// app/Http/Controllers/AttendanceController.php
namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceAudit;
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
            'startTime' => 'required',
            'endTime' => 'nullable',
            'location' => 'nullable|string|max:255',
            'attendanceType' => 'nullable|string|max:30',
            'audit' => 'nullable|array',
            'audit.*.action' => 'required_with:audit|string',
            'audit.*.time' => 'required_with:audit|string',
            'audit.*.comment' => 'nullable|string',
            'audit.*.reason' => 'nullable|string'
        ]);
        
        try {
            $result = $this->attendanceService->addAttendance($employeeId, $validated);
            
            return response()->json([
                'success' => true,
                'message' => 'Attendance added successfully',
                'data' => $result
            ], 200);
            
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
        $dateFrom = $request->query('dateFrom');
        $dateTo = $request->query('dateTo'); 
        $pageIndex = (int) $request->query('pageIndex', 0);
        $pageSize = (int) $request->query('pageSize', 7);
        
        try {
            $result = $this->attendanceService->getAttendanceByEmployee(
                $employeeId, $dateFrom, $dateTo, $pageIndex, $pageSize
            );
            
            return response()->json([
                'success' => true,
                'data' => $result
            ], 200);
            
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
            'startTime' => 'required',
            'endTime' => 'nullable',
            'location' => 'nullable|string|max:255',
            'audit' => 'nullable|array'
        ]);
        
        try {
            $result = $this->attendanceService->updateAttendance(
                $employeeId, $attendanceId, $validated
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Attendance updated successfully',
                'data' => $result
            ], 200);
            
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
            'employeeId' => 'required|exists:employee_data,id'
        ]);
        
        try {
            $result = $this->attendanceService->toggleAttendanceConfig($validated['employeeId']);
            
            return response()->json([
                'success' => true,
                'message' => 'Attendance configuration updated successfully',
                'data' => $result
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
    
    /**
     * Trigger Time Doctor sync job manually
     * POST /api/attendance/trigger-fetch-timesheet-summary-stats
     */
    public function triggerTimeDoctorSync(Request $request)
    {
        $validated = $request->validate([
            'forDate' => 'required|date'
        ]);
        
        try {
            $result = $this->timeDoctorService->syncAttendanceForDate($validated['forDate']);
            
            return response()->json([
                'success' => true,
                'message' => 'Time Doctor sync job triggered successfully',
                'data' => $result
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
```

### 4. Service Layer Implementation

#### AttendanceService
```php
<?php
// app/Services/AttendanceService.php
namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceAudit;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceService
{
    /**
     * Add attendance with validation and audit trail
     */
    public function addAttendance($employeeId, array $data)
    {
        // Check if manual attendance allowed
        $employee = Employee::with('employmentDetail')->findOrFail($employeeId);
        
        if (!$employee->employmentDetail->is_manual_attendance) {
            throw new \Exception('Manual attendance not allowed. Attendance is auto-synced from Time Doctor.');
        }
        
        // Check if attendance already exists for date
        $existingAttendance = Attendance::forEmployee($employeeId)
            ->where('date', $data['date'])
            ->first();
            
        if ($existingAttendance) {
            return $this->updateAttendance($employeeId, $existingAttendance->id, $data);
        }
        
        return DB::transaction(function () use ($employeeId, $data) {
            // Convert IST to UTC
            $utcData = $this->convertIstToUtc($data);
            
            // Calculate total hours
            $totalHours = $this->calculateTotalHours($utcData, $data['audit'] ?? []);
            
            // Create attendance record
            $attendance = Attendance::create([
                'employee_id' => $employeeId,
                'date' => $utcData['date'],
                'start_time' => $utcData['startTime'],
                'end_time' => $utcData['endTime'],
                'day' => Carbon::parse($data['date'])->format('l'), // Monday, Tuesday, etc.
                'attendance_type' => $data['attendanceType'] ?? 'Manual',
                'total_hours' => $totalHours,
                'location' => $data['location'],
                'created_by' => auth()->user()->email
            ]);
            
            // Create audit trail
            if (!empty($data['audit'])) {
                foreach ($data['audit'] as $audit) {
                    AttendanceAudit::create([
                        'attendance_id' => $attendance->id,
                        'action' => $audit['action'],
                        'time' => $audit['time'],
                        'comment' => $audit['comment'] ?? null,
                        'reason' => $audit['reason'] ?? null
                    ]);
                }
            }
            
            return $attendance->load('audits');
        });
    }
    
    /**
     * Get attendance records with pagination and filters
     */
    public function getAttendanceByEmployee($employeeId, $dateFrom = null, $dateTo = null, $pageIndex = 0, $pageSize = 7)
    {
        $query = Attendance::forEmployee($employeeId)
            ->with('audits')
            ->orderBy('date', 'desc');
            
        // Apply date range filter
        if ($dateFrom && $dateTo) {
            $query->inDateRange($dateFrom, $dateTo);
        } elseif (!$dateFrom && !$dateTo) {
            // Default to current week
            $startOfWeek = Carbon::now()->startOfWeek();
            $endOfWeek = Carbon::now()->endOfWeek();
            $query->inDateRange($startOfWeek->format('Y-m-d'), $endOfWeek->format('Y-m-d'));
        }
        
        // Pagination
        $offset = $pageIndex * $pageSize;
        $totalRecords = $query->count();
        $records = $query->offset($offset)->limit($pageSize)->get();
        
        // Convert UTC to IST for response
        $attendanceReport = $records->map(function ($record) {
            return $this->convertUtcToIst($record);
        });
        
        // Get employee attendance configuration
        $employee = Employee::with('employmentDetail')->findOrFail($employeeId);
        $isManualAttendance = $employee->employmentDetail->is_manual_attendance;
        
        // Check if employee has timed in today
        $today = Carbon::today();
        $todayAttendance = Attendance::forEmployee($employeeId)
            ->where('date', $today->format('Y-m-d'))
            ->with('audits')
            ->first();
            
        $isTimedIn = false;
        if ($todayAttendance && $todayAttendance->audits->isNotEmpty()) {
            $lastAudit = $todayAttendance->audits->last();
            $isTimedIn = in_array($lastAudit->action, ['Time In', 'Resume']);
        }
        
        // Get dates with attendance for calendar
        $datesWithAttendance = Attendance::forEmployee($employeeId)
            ->selectRaw('DISTINCT date')
            ->pluck('date')
            ->map(fn($date) => $date->format('Y-m-d'))
            ->toArray();
        
        return [
            'attendanceReport' => $attendanceReport,
            'totalRecords' => $totalRecords,
            'isManualAttendance' => $isManualAttendance,
            'isTimedIn' => $isTimedIn,
            'dates' => $datesWithAttendance
        ];
    }
    
    /**
     * Convert IST input to UTC for storage
     */
    private function convertIstToUtc(array $data): array
    {
        $utcData = $data;
        
        if (!empty($data['startTime'])) {
            $istTime = Carbon::createFromFormat('H:i', $data['startTime'], 'Asia/Kolkata');
            $utcData['startTime'] = $istTime->utc()->format('H:i:s');
        }
        
        if (!empty($data['endTime'])) {
            $istTime = Carbon::createFromFormat('H:i', $data['endTime'], 'Asia/Kolkata');
            $utcData['endTime'] = $istTime->utc()->format('H:i:s');
        }
        
        return $utcData;
    }
    
    /**
     * Convert UTC stored data to IST for display
     */
    private function convertUtcToIst($attendance): array
    {
        return [
            'id' => $attendance->id,
            'date' => $attendance->date->format('Y-m-d'),
            'day' => $attendance->day,
            'startTime' => $attendance->start_time ? 
                Carbon::parse($attendance->start_time)->tz('Asia/Kolkata')->format('H:i') : '',
            'endTime' => $attendance->end_time ? 
                Carbon::parse($attendance->end_time)->tz('Asia/Kolkata')->format('H:i') : '',
            'totalHours' => $attendance->total_hours,
            'location' => $attendance->location ?? '',
            'attendanceType' => $attendance->attendance_type,
            'audit' => $attendance->audits->map(function ($audit) {
                return [
                    'action' => $audit->action,
                    'time' => $audit->time,
                    'comment' => $audit->comment,
                    'reason' => $audit->reason
                ];
            })->toArray()
        ];
    }
}
```

---

## 🎨 Frontend Migration Plan (Vue.js)

### 1. React to Vue.js Component Mapping

Based on analysis of React components in `Legacy-Folder/Frontend`, here's the verified mapping:

| React Component | Vue Equivalent | Description | Migration Notes |
|-----------------|----------------|-------------|-----------------|
| `Attendance/Employee/index.tsx` | `AttendanceEmployee.vue` | Main attendance page container | Convert useState to reactive refs |
| `AttendanceTable/index.tsx` | `AttendanceTable.vue` | Data table with pagination | Map Material React Table to Vuetify VDataTable |
| `TimeInDialog.tsx` | `TimeInDialog.vue` | Time entry modal form | Convert React Hook Form to VeeValidate |
| `TimeOutDialog.tsx` | `TimeOutDialog.vue` | Time out confirmation modal | Simple state conversion |
| `AttendanceFilter.tsx` | `AttendanceFilter.vue` | Date range filter component | Map MUI DatePicker to Vuetify VDatePicker |
| `useAttendanceDialogs.tsx` | `useAttendanceDialogs.ts` | Custom hook for state management | Convert to Vue 3 Composable |

### 2. Vue.js Implementation Strategy

#### Main Attendance Page Container
```vue
<!-- src/views/attendance/AttendanceEmployee.vue -->
<template>
  <div class="attendance-page">
    <v-breadcrumbs :items="breadcrumbItems" />
    
    <v-card elevation="3" class="attendance-container">
      <v-card-title class="attendance-header">
        <v-row align="center">
          <v-col>
            <h2>My Attendance</h2>
          </v-col>
          <v-col cols="auto">
            <v-btn
              v-if="isManualAttendance && showTimeInButton"
              color="primary"
              @click="handleTimeInButton"
            >
              Time In
            </v-btn>
            <v-btn
              v-else-if="isManualAttendance && !showTimeInButton"
              color="error"
              @click="openTimeOutDialog"
            >
              Time Out
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      
      <v-card-text>
        <AttendanceTable
          v-model:pagination="pagination"
          :records="attendanceRecords"
          :total-records="totalRecords"
          :loading="loading"
          :is-manual-attendance="isManualAttendance"
          :show-time-in-button="showTimeInButton"
          @edit="handleEdit"
          @time-out="openTimeOutDialog"
          @filter="handleFilter"
        />
      </v-card-text>
    </v-card>
    
    <!-- Time In Dialog -->
    <TimeInDialog
      v-model="timeInDialog.open"
      :edit-data="timeInDialog.editData"
      :loading="timeInDialog.loading"
      :filled-dates="filledDates"
      @submit="handleTimeIn"
    />
    
    <!-- Time Out Dialog -->
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

const handleFilter = async (filters: any) => {
  loading.value = true
  try {
    await attendanceStore.fetchAttendanceRecords(filters)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  loading.value = true
  try {
    await attendanceStore.fetchAttendanceRecords()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.attendance-container {
  background: #ffffff;
}

.attendance-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}
</style>
```

#### Attendance Data Table Component
```vue
<!-- src/components/attendance/AttendanceTable.vue -->
<template>
  <div class="attendance-table-container">
    <!-- Filter Section -->
    <v-expansion-panels v-if="isManualAttendance" class="mb-4">
      <v-expansion-panel>
        <v-expansion-panel-title>
          <v-icon>mdi-filter</v-icon>
          Filters
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <AttendanceFilter
            v-model:start-date="filters.startDate"
            v-model:end-date="filters.endDate"
            @apply="applyFilters"
            @reset="resetFilters"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    
    <!-- Data Table -->
    <v-data-table-server
      v-model:page="pagination.page"
      v-model:items-per-page="pagination.itemsPerPage"
      v-model:sort-by="pagination.sortBy"
      :headers="tableHeaders"
      :items="records"
      :items-length="totalRecords"
      :loading="loading"
      :items-per-page-options="[
        { value: 7, title: '7' },
        { value: 14, title: '14' },
        { value: 30, title: '30' }
      ]"
      class="attendance-table"
    >
      <!-- Date Column -->
      <template #item.date="{ item }">
        <span>{{ formatDate(item.date) }}</span>
      </template>
      
      <!-- Time Columns -->
      <template #item.startTime="{ item }">
        <v-chip 
          v-if="item.startTime"
          color="primary"
          variant="outlined"
          size="small"
        >
          {{ item.startTime }}
        </v-chip>
      </template>
      
      <template #item.endTime="{ item }">
        <v-chip 
          v-if="item.endTime"
          color="success"
          variant="outlined"
          size="small"
        >
          {{ item.endTime }}
        </v-chip>
      </template>
      
      <!-- Total Hours -->
      <template #item.totalHours="{ item }">
        <v-chip 
          v-if="item.totalHours"
          color="info"
          variant="outlined"
          size="small"
        >
          {{ item.totalHours }}
        </v-chip>
      </template>
      
      <!-- Attendance Type -->
      <template #item.attendanceType="{ item }">
        <v-chip 
          :color="getAttendanceTypeColor(item.attendanceType)"
          variant="outlined"
          size="small"
        >
          {{ item.attendanceType }}
        </v-chip>
      </template>
      
      <!-- Actions Column -->
      <template #item.actions="{ item }">
        <div class="action-buttons">
          <v-btn
            v-if="isManualAttendance"
            icon="mdi-pencil"
            size="small"
            variant="outlined"
            color="primary"
            @click="editAttendance(item)"
          />
          <v-btn
            v-if="isManualAttendance && canTimeOut(item)"
            icon="mdi-clock-out"
            size="small"
            variant="outlined"
            color="error"
            @click="timeOutAttendance(item)"
          />
        </div>
      </template>
    </v-data-table-server>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { format } from 'date-fns'
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

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  edit: [record: any]
  'time-out': [record: any]
  filter: [filters: any]
  'update:pagination': [pagination: any]
}>()

// Reactive data
const filters = reactive({
  startDate: null,
  endDate: null
})

// Computed properties
const tableHeaders = computed(() => [
  { title: 'Date', key: 'date', sortable: true },
  { title: 'Day', key: 'day', sortable: false },
  { title: 'Start Time', key: 'startTime', sortable: false },
  { title: 'End Time', key: 'endTime', sortable: false },
  { title: 'Total Hours', key: 'totalHours', sortable: false },
  { title: 'Location', key: 'location', sortable: false },
  { title: 'Type', key: 'attendanceType', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, width: 120 }
])

// Methods
const formatDate = (date: string) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

const getAttendanceTypeColor = (type: string) => {
  return type === 'Manual' ? 'primary' : 'success'
}

const canTimeOut = (item: any) => {
  const today = new Date().toISOString().split('T')[0]
  return item.date === today && item.startTime && !item.endTime
}

const editAttendance = (item: any) => {
  emit('edit', item)
}

const timeOutAttendance = (item: any) => {
  emit('time-out', item)
}

const applyFilters = () => {
  emit('filter', { ...filters })
}

const resetFilters = () => {
  filters.startDate = null
  filters.endDate = null
  emit('filter', {})
}
</script>

<style scoped>
.attendance-table-container {
  width: 100%;
}

.attendance-table {
  --v-table-header-background: #f5f5f5;
}

.action-buttons {
  display: flex;
  gap: 8px;
}
</style>
```

**[Continued in Part 3...]**

---

## 📄 Changelog
**Version:** v1.0.0 (Part 2)  
**Date:** November 13, 2025  
**Changes:**  
- Completed Laravel controller implementation with validation
- Added comprehensive AttendanceService with business logic
- Implemented timezone conversion (IST ↔ UTC) functionality
- Created Vue.js main page and data table components
- Mapped React Material-UI components to Vuetify equivalents
- Established component communication patterns with props/emits

**Completed in Part 2:**
- Laravel Backend Implementation (Controllers, Services, Models)
- Vue.js Frontend Foundation (Main components, Table component)
- Component mapping strategy from React to Vue.js

**Next in Part 3:**
- Time entry dialogs implementation (TimeInDialog, TimeOutDialog)
- State management with Pinia stores
- API integration layer and service mapping
- Testing strategy and implementation timeline
- Risk assessment and mitigation strategies