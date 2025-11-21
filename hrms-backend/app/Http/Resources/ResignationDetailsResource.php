<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ResignationDetailsResource extends JsonResource
{
    /**
     * Transform the resource into an array (matching legacy format).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id' => $this->Id,
            'employeeId' => $this->EmployeeId,
            'employeeName' => $this->employee ? ($this->employee->first_name . ' ' . $this->employee->last_name) : 'N/A',
            'departmentId' => $this->DepartmentID,
            'department' => $this->department ? $this->department->department_name : 'N/A',
            'reportingManagerId' => $this->ReportingManagerId,
            'reportingManager' => $this->reportingManager ? ($this->reportingManager->first_name . ' ' . $this->reportingManager->last_name) : 'N/A',
            'reason' => $this->Reason,
            'lastWorkingDay' => $this->LastWorkingDay ? $this->LastWorkingDay->format('Y-m-d') : null,
            'resignationDate' => $this->CreatedOn ? $this->CreatedOn->format('Y-m-d') : null,
            'status' => $this->Status,
            'isActive' => $this->IsActive,
            'earlyReleaseDate' => $this->EarlyReleaseDate ? $this->EarlyReleaseDate->format('Y-m-d') : null,
            'earlyReleaseStatus' => $this->EarlyReleaseStatus,
            'rejectResignationReason' => $this->RejectResignationReason,
            'rejectEarlyReleaseReason' => $this->RejectEarlyReleaseReason,
        ];
    }
}
