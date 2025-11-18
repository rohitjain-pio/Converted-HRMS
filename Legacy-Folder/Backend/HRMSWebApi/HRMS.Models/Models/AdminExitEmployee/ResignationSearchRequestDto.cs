using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Employees
{
    public class ResignationSearchRequestDto
    {
        public string? EmployeeName { get; set; } 
        public ResignationStatus? ResignationStatus { get; set; } 
        public DateOnly? LastWorkingDayFrom { get; set; }
        public DateOnly? LastWorkingDayTo { get; set; }
        public bool? AccountsNoDue { get; set; }
        public bool? ItNoDue { get; set; }
        public DateOnly? ResignationDate { get; set; }
        public int? EmployeeStatus { get; set; }
        public string? EmployeeCode { get; set; }
        public int? BranchId { get; set; }
        public int? DepartmentId { get; set; }
    }
}
