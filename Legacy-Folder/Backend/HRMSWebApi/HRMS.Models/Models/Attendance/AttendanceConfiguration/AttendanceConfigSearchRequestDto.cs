using System;

namespace HRMS.Models.Models.AttendanceConfiguration
{
    public class AttendanceConfigSearchRequestDto
    {
        public long? EmployeeId { get; set; }
        public string? EmployeeCode { get; set; }
        public string? EmployeeName { get; set; }
        public string? EmployeeEmail { get; set; }
        public long? BranchId { get; set; }
        public long? DesignationId { get; set; }
        public long? DepartmentId { get; set; }
        public bool? IsManualAttendance { get; set; }
        public DateOnly? DOJFrom { get; set; }
        public DateOnly? DOJTo { get; set; }
        public int ? CountryId { get; set; }
    }
}
