namespace HRMS.Models.Models.KPI
{
    public class GetEmployeeRatingByManagerResponseDto
    {
        public string? EmployeeCode { get; set; }
        public string? EmployeeName { get; set; }
        public string? Email { get; set; }
        public long EmployeeId { get; set; }
        public DateOnly? JoiningDate { get; set; }
        public List<PlanRatingDto>? Ratings { get; set; }
    }
}
