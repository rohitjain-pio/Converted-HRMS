<?php
namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Resignation;
use App\Models\HRClearance;
use App\Models\DepartmentClearance;
use App\Models\AccountClearance;
use App\Models\ITClearance;
use App\Models\ResignationHistory;

class ExitManagementTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_creates_and_retrieves_resignation_with_clearances()
    {
        // Create resignation
        $resignation = Resignation::create([
            'EmployeeId' => 1,
            'DepartmentID' => 1,
            'Reason' => 'Personal',
            'CreatedOn' => now(),
            'CreatedBy' => 'test',
        ]);

        // Attach clearances
        $hr = HRClearance::create([
            'ResignationId' => $resignation->Id,
            'AdvanceBonusRecoveryAmount' => 0,
            'CreatedOn' => now(),
            'CreatedBy' => 'test',
        ]);
        $dept = DepartmentClearance::create([
            'ResignationId' => $resignation->Id,
            'KTNotes' => 'KT done',
            'Attachment' => '',
            'KTUsers' => 'user1',
            'CreatedOn' => now(),
            'CreatedBy' => 'test',
        ]);
        $acc = AccountClearance::create([
            'ResignationId' => $resignation->Id,
            'FnFStatus' => true,
            'CreatedOn' => now(),
            'CreatedBy' => 'test',
        ]);
        $it = ITClearance::create([
            'ResignationId' => $resignation->Id,
            'AccessRevoked' => true,
            'AssetReturned' => true,
            'CreatedOn' => now(),
            'CreatedBy' => 'test',
        ]);

        // Retrieve and assert
        $fetched = Resignation::with(['hrClearance', 'departmentClearance', 'accountClearance', 'itClearance'])->find($resignation->Id);
        $this->assertNotNull($fetched->hrClearance);
        $this->assertNotNull($fetched->departmentClearance);
        $this->assertNotNull($fetched->accountClearance);
        $this->assertNotNull($fetched->itClearance);
    }

    /** @test */
    public function it_tracks_resignation_history()
    {
        $resignation = Resignation::create([
            'EmployeeId' => 1,
            'DepartmentID' => 1,
            'Reason' => 'Personal',
            'CreatedOn' => now(),
            'CreatedBy' => 'test',
        ]);
        $history = ResignationHistory::create([
            'ResignationId' => $resignation->Id,
            'ResignationStatus' => 1,
            'CreatedOn' => now(),
            'CreatedBy' => 'test',
        ]);
        $this->assertEquals($resignation->Id, $history->ResignationId);
    }
}
