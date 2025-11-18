using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Employees
{
    public class EmployeeSearchRequestDto
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string EmployeeName { get; set; } = string.Empty;
        public int DepartmentId { get; set; }
        public int DesignationId { get; set; }
        public int RoleId { get; set; }
        public int EmployeeStatus { get; set; }
        public int EmploymentStatus { get; set; }

        public string? EmployeeEmail { get; set; }
        public long? BranchId { get; set; }
        public long? CountryId { get; set; }
        public DateOnly? DOJFrom { get; set; }
        public DateOnly? DOJTo { get; set; }
    }
}
