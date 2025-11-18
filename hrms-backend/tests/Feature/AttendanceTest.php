<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Attendance;
use App\Models\AttendanceAudit;
use App\Models\EmployeeData;
use App\Models\EmploymentDetail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Carbon\Carbon;

class AttendanceTest extends TestCase
{
    use WithFaker;
    
    protected $user;
    protected $employee;
    
    // Use MySQL database instead of SQLite for testing
    protected function getEnvironmentSetUp($app)
    {
        $app['config']->set('database.default', 'mysql');
    }
    
    protected function setUp(): void
    {
        parent::setUp();
        
        // Create authenticated user
        $this->user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password')
        ]);
        
        // Get or create employee record
        $this->employee = EmployeeData::first();
        
        if (!$this->employee) {
            // Create a test employee if none exists
            $this->employee = EmployeeData::create([
                'employee_code' => 'EMP001',
                'first_name' => 'Test',
                'last_name' => 'Employee',
                'email' => 'test@example.com',
                'date_of_birth' => '1990-01-01',
                'gender' => 'Male',
                'marital_status' => 'Single'
            ]);
        }
        
        // Ensure employment detail exists with manual attendance enabled
        $employmentDetail = EmploymentDetail::where('employee_id', $this->employee->id)->first();
        if (!$employmentDetail) {
            EmploymentDetail::create([
                'employee_id' => $this->employee->id,
                'is_manual_attendance' => true,
                'date_of_joining' => Carbon::now()->subYear()
            ]);
        } else {
            $employmentDetail->update(['is_manual_attendance' => true]);
        }
    }
    
    /** @test */
    public function employee_can_add_attendance_record()
    {
        $attendanceData = [
            'date' => Carbon::today()->format('Y-m-d'),
            'startTime' => '09:00',
            'endTime' => '18:00',
            'location' => 'Jaipur Office',
            'attendanceType' => 'Manual',
            'audit' => [
                ['action' => 'Time In', 'time' => '09:00', 'comment' => 'Starting work', 'reason' => null],
                ['action' => 'Time Out', 'time' => '18:00', 'comment' => 'Ending work', 'reason' => null]
            ]
        ];
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/attendance/add-attendance/{$this->employee->id}", $attendanceData);
        
        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'id',
                    'employee_id',
                    'date',
                    'start_time',
                    'end_time',
                    'total_hours'
                ]
            ]);
        
        $this->assertDatabaseHas('attendance', [
            'employee_id' => $this->employee->id,
            'date' => Carbon::today()->format('Y-m-d'),
            'attendance_type' => 'Manual',
            'location' => 'Jaipur Office'
        ]);
        
        // Verify audit trail was created
        $attendance = Attendance::where('employee_id', $this->employee->id)
            ->where('date', Carbon::today()->format('Y-m-d'))
            ->first();
            
        $this->assertDatabaseHas('attendance_audit', [
            'attendance_id' => $attendance->id,
            'action' => 'Time In',
            'time' => '09:00'
        ]);
        
        $this->assertDatabaseHas('attendance_audit', [
            'attendance_id' => $attendance->id,
            'action' => 'Time Out',
            'time' => '18:00'
        ]);
    }
    
    /** @test */
    public function employee_cannot_add_future_date_attendance()
    {
        $futureDate = Carbon::tomorrow()->format('Y-m-d');
        
        $attendanceData = [
            'date' => $futureDate,
            'startTime' => '09:00',
            'location' => 'Jaipur Office',
            'attendanceType' => 'Manual'
        ];
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/attendance/add-attendance/{$this->employee->id}", $attendanceData);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date']);
    }
    
    /** @test */
    public function employee_can_get_attendance_records_with_pagination()
    {
        // Create test attendance records
        for ($i = 0; $i < 10; $i++) {
            Attendance::create([
                'employee_id' => $this->employee->id,
                'date' => Carbon::today()->subDays($i)->format('Y-m-d'),
                'start_time' => '09:00:00',
                'end_time' => '18:00:00',
                'day' => Carbon::today()->subDays($i)->format('l'),
                'attendance_type' => 'Manual',
                'total_hours' => '09:00',
                'location' => 'Jaipur Office',
                'created_on' => now(),
                'created_by' => 'test@example.com'
            ]);
        }
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson("/api/attendance/get-attendance/{$this->employee->id}?pageIndex=0&pageSize=7");
        
        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'attendanceReport',
                    'totalRecords',
                    'isManualAttendance',
                    'isTimedIn',
                    'dates'
                ]
            ]);
        
        $data = $response->json('data');
        $this->assertCount(7, $data['attendanceReport']);
        $this->assertEquals(10, $data['totalRecords']);
        $this->assertTrue($data['isManualAttendance']);
    }
    
    /** @test */
    public function employee_can_update_existing_attendance()
    {
        // Create initial attendance
        $attendance = Attendance::create([
            'employee_id' => $this->employee->id,
            'date' => Carbon::today()->format('Y-m-d'),
            'start_time' => '09:00:00',
            'end_time' => null,
            'day' => Carbon::today()->format('l'),
            'attendance_type' => 'Manual',
            'total_hours' => '00:00',
            'location' => 'Jaipur Office',
            'created_on' => now(),
            'created_by' => 'test@example.com'
        ]);
        
        $updateData = [
            'date' => Carbon::today()->format('Y-m-d'),
            'startTime' => '09:00',
            'endTime' => '18:30',
            'location' => 'Jaipur Office',
            'audit' => [
                ['action' => 'Time Out', 'time' => '18:30', 'comment' => 'Updated end time', 'reason' => 'Forgot to time out']
            ]
        ];
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->putJson("/api/attendance/update-attendance/{$this->employee->id}/{$attendance->id}", $updateData);
        
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
        
        $this->assertDatabaseHas('attendance', [
            'id' => $attendance->id,
            'employee_id' => $this->employee->id
        ]);
    }
    
    /** @test */
    public function start_time_is_required_for_attendance()
    {
        $attendanceData = [
            'date' => Carbon::today()->format('Y-m-d'),
            'location' => 'Jaipur Office',
            'attendanceType' => 'Manual'
            // Missing startTime
        ];
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/attendance/add-attendance/{$this->employee->id}", $attendanceData);
        
        // Should pass validation but fail in service layer
        // since startTime is nullable in validation but required in business logic
        $response->assertStatus(400);
    }
    
    /** @test */
    public function location_is_required_for_attendance()
    {
        $attendanceData = [
            'date' => Carbon::today()->format('Y-m-d'),
            'startTime' => '09:00',
            'attendanceType' => 'Manual'
            // Missing location
        ];
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/attendance/add-attendance/{$this->employee->id}", $attendanceData);
        
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['location']);
    }
    
    /** @test */
    public function can_toggle_attendance_configuration()
    {
        $initialConfig = EmploymentDetail::where('employee_id', $this->employee->id)->first();
        $initialValue = $initialConfig->is_manual_attendance;
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->putJson('/api/attendance/update-config', [
                'employeeId' => $this->employee->id
            ]);
        
        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'employeeId',
                    'isManualAttendance'
                ]
            ]);
        
        $updatedConfig = EmploymentDetail::where('employee_id', $this->employee->id)->first();
        $this->assertEquals(!$initialValue, $updatedConfig->is_manual_attendance);
    }
    
    /** @test */
    public function total_hours_are_calculated_correctly()
    {
        $attendanceData = [
            'date' => Carbon::today()->format('Y-m-d'),
            'startTime' => '09:00',
            'endTime' => '18:30',
            'location' => 'Jaipur Office',
            'attendanceType' => 'Manual',
            'audit' => [
                ['action' => 'Time In', 'time' => '09:00', 'comment' => 'Start', 'reason' => null],
                ['action' => 'Time Out', 'time' => '18:30', 'comment' => 'End', 'reason' => null]
            ]
        ];
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/attendance/add-attendance/{$this->employee->id}", $attendanceData);
        
        $response->assertStatus(200);
        
        $attendance = Attendance::where('employee_id', $this->employee->id)
            ->where('date', Carbon::today()->format('Y-m-d'))
            ->first();
        
        // Total hours should be 09:30
        $this->assertEquals('09:30', $attendance->total_hours);
    }
    
    /** @test */
    public function cannot_add_attendance_if_manual_attendance_not_allowed()
    {
        // Disable manual attendance
        EmploymentDetail::where('employee_id', $this->employee->id)
            ->update(['is_manual_attendance' => false]);
        
        $attendanceData = [
            'date' => Carbon::today()->format('Y-m-d'),
            'startTime' => '09:00',
            'endTime' => '18:00',
            'location' => 'Jaipur Office',
            'attendanceType' => 'Manual'
        ];
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/attendance/add-attendance/{$this->employee->id}", $attendanceData);
        
        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Manual attendance not allowed. Attendance is auto-synced from Time Doctor.'
            ]);
        
        // Re-enable for other tests
        EmploymentDetail::where('employee_id', $this->employee->id)
            ->update(['is_manual_attendance' => true]);
    }
    
    /** @test */
    public function attendance_config_list_endpoint_exists()
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/attendance/get-attendance-config-list', [
                'pageIndex' => 0,
                'pageSize' => 10
            ]);
        
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }
    
    /** @test */
    public function employee_report_endpoint_exists()
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/attendance/get-employee-report', [
                'pageIndex' => 0,
                'pageSize' => 10,
                'dateFrom' => Carbon::today()->subMonth()->format('Y-m-d'),
                'dateTo' => Carbon::today()->format('Y-m-d')
            ]);
        
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
    }
    
    /** @test */
    public function duplicate_date_attendance_updates_existing_record()
    {
        // Create initial attendance
        $attendance = Attendance::create([
            'employee_id' => $this->employee->id,
            'date' => Carbon::today()->format('Y-m-d'),
            'start_time' => '09:00:00',
            'end_time' => null,
            'day' => Carbon::today()->format('l'),
            'attendance_type' => 'Manual',
            'total_hours' => '00:00',
            'location' => 'Jaipur Office',
            'created_on' => now(),
            'created_by' => 'test@example.com'
        ]);
        
        // Try to add attendance for same date
        $attendanceData = [
            'date' => Carbon::today()->format('Y-m-d'),
            'startTime' => '09:00',
            'endTime' => '18:00',
            'location' => 'Jaipur Office',
            'attendanceType' => 'Manual'
        ];
        
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson("/api/attendance/add-attendance/{$this->employee->id}", $attendanceData);
        
        $response->assertStatus(200);
        
        // Should only have one record for this date
        $count = Attendance::where('employee_id', $this->employee->id)
            ->where('date', Carbon::today()->format('Y-m-d'))
            ->count();
        
        $this->assertEquals(1, $count);
    }
    
    protected function tearDown(): void
    {
        // Clean up test data
        Attendance::where('employee_id', $this->employee->id)->delete();
        AttendanceAudit::whereIn('attendance_id', function($query) {
            $query->select('id')
                ->from('attendance')
                ->where('employee_id', $this->employee->id);
        })->delete();
        
        parent::tearDown();
    }
}
