<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Attendance;
use App\Models\AttendanceAudit;
use Carbon\Carbon;

class AttendanceIntegrationTest extends TestCase
{
    /**
     * Test that attendance API endpoint is accessible
     */
    public function test_attendance_routes_exist()
    {
        // Test add attendance endpoint exists
        $response = $this->postJson('/api/attendance/add-attendance/1', []);
        // We expect 401 (unauthorized) not 404 (not found)
        $this->assertNotEquals(404, $response->status());
        
        // Test get attendance endpoint exists
        $response = $this->getJson('/api/attendance/get-attendance/1');
        $this->assertNotEquals(404, $response->status());
        
        // Test update config endpoint exists
        $response = $this->putJson('/api/attendance/update-config', []);
        $this->assertNotEquals(404, $response->status());
    }
    
    /**
     * Test Attendance model exists and can be instantiated
     */
    public function test_attendance_model_exists()
    {
        $this->assertTrue(class_exists('App\Models\Attendance'));
        $this->assertTrue(class_exists('App\Models\AttendanceAudit'));
        
        $attendance = new Attendance();
        $this->assertInstanceOf(Attendance::class, $attendance);
        
        $audit = new AttendanceAudit();
        $this->assertInstanceOf(AttendanceAudit::class, $audit);
    }
    
    /**
     * Test Attendance model has correct table name
     */
    public function test_attendance_model_table_name()
    {
        $attendance = new Attendance();
        $this->assertEquals('attendance', $attendance->getTable());
        
        $audit = new AttendanceAudit();
        $this->assertEquals('attendance_audit', $audit->getTable());
    }
    
    /**
     * Test Attendance model fillable attributes
     */
    public function test_attendance_model_fillable_attributes()
    {
        $attendance = new Attendance();
        $fillable = $attendance->getFillable();
        
        $expectedFillable = [
            'employee_id', 'date', 'start_time', 'end_time', 'day',
            'attendance_type', 'total_hours', 'location', 'created_on',
            'created_by', 'modified_by', 'modified_on'
        ];
        
        foreach ($expectedFillable as $field) {
            $this->assertContains($field, $fillable, "Field {$field} should be fillable");
        }
    }
    
    /**
     * Test AttendanceService exists
     */
    public function test_attendance_service_exists()
    {
        $this->assertTrue(class_exists('App\Services\AttendanceService'));
    }
    
    /**
     * Test AttendanceController exists
     */
    public function test_attendance_controller_exists()
    {
        $this->assertTrue(class_exists('App\Http\Controllers\AttendanceController'));
    }
    
    /**
     * Test attendance table exists in database
     */
    public function test_attendance_table_exists()
    {
        $this->assertDatabaseTableExists('attendance');
        $this->assertDatabaseTableExists('attendance_audit');
    }
    
    /**
     * Test attendance table has correct columns
     */
    public function test_attendance_table_has_correct_columns()
    {
        $this->assertDatabaseHasColumn('attendance', 'id');
        $this->assertDatabaseHasColumn('attendance', 'employee_id');
        $this->assertDatabaseHasColumn('attendance', 'date');
        $this->assertDatabaseHasColumn('attendance', 'start_time');
        $this->assertDatabaseHasColumn('attendance', 'end_time');
        $this->assertDatabaseHasColumn('attendance', 'day');
        $this->assertDatabaseHasColumn('attendance', 'attendance_type');
        $this->assertDatabaseHasColumn('attendance', 'total_hours');
        $this->assertDatabaseHasColumn('attendance', 'location');
        $this->assertDatabaseHasColumn('attendance', 'created_on');
        $this->assertDatabaseHasColumn('attendance', 'created_by');
        $this->assertDatabaseHasColumn('attendance', 'modified_by');
        $this->assertDatabaseHasColumn('attendance', 'modified_on');
    }
    
    /**
     * Test attendance audit table has correct columns
     */
    public function test_attendance_audit_table_has_correct_columns()
    {
        $this->assertDatabaseHasColumn('attendance_audit', 'id');
        $this->assertDatabaseHasColumn('attendance_audit', 'attendance_id');
        $this->assertDatabaseHasColumn('attendance_audit', 'action');
        $this->assertDatabaseHasColumn('attendance_audit', 'time');
        $this->assertDatabaseHasColumn('attendance_audit', 'comment');
        $this->assertDatabaseHasColumn('attendance_audit', 'reason');
    }
    
    /**
     * Helper method to check if table exists
     */
    protected function assertDatabaseTableExists($table)
    {
        $tables = \DB::select("SHOW TABLES LIKE '{$table}'");
        $this->assertNotEmpty($tables, "Table {$table} should exist in database");
    }
    
    /**
     * Helper method to check if column exists
     */
    protected function assertDatabaseHasColumn($table, $column)
    {
        $columns = \DB::select("SHOW COLUMNS FROM {$table} LIKE '{$column}'");
        $this->assertNotEmpty($columns, "Column {$column} should exist in table {$table}");
    }
}
