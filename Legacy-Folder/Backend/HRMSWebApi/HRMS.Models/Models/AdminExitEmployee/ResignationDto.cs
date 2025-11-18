namespace HRMS.Models.Models.Employees
{
    public class ResignationDto
    {
        public required string Email { get; set; }
        public required string FirstName { get; set; }
        public string? MiddleName { get; set; }
        public required string LastName { get; set; }
        public DateTime? LastWorkingDay { get; set; }
        public string? Reason { get; set; }
        public string? DepartmentName { get; set; }
        public string? ReportingManagerName { get; set; }
        public string? ReportingManagerEmail { get; set; }
        public DateTime CreatedOn { get; set; }
        public string? RejectResignationReason { get; set; }
        public DateTime? EarlyReleaseDate { get; set; }
        public string? PersonalEmail { get; set; }
}

}
