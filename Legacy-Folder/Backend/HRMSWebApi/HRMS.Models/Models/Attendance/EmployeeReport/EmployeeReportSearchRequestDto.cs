using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRMS.Models.Models.EmployeeReport
{
    public class EmployeeReportSearchRequestDto
    {
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public string? EmployeeCode { get; set; }
        public List<string>? EmployeeCodes { get; set; }
        public string? EmployeeName { get; set; }
        public string? EmployeeEmail { get; set; }
        public long? BranchId { get; set; }
        public long? CountryId { get; set; }
        public long? DesignationId { get; set; }
        public long? DepartmentId { get; set; }
        public bool? IsManualAttendance { get; set; }
        public DateOnly? DOJFrom { get; set; }
        public DateOnly? DOJTo { get; set; }
    }
}