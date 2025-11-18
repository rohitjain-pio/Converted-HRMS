namespace HRMS.Models.Models.Dashboard
{
    public class DashboardRequestDto
    {
        public int Days { get; set; }
        public DateOnly? From { get; set; }
        public DateOnly? To { get; set; }
    }
}
