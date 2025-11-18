namespace HRMS.Models.Models.KPI
{
    public class ManagerRatingHistoryByGoalResponseDto
    {
        public long ManagerId { get; set; }
        public string? ManagerName { get; set; } 
        public decimal? ManagerRating { get; set; }
        public string? ManagerComment { get; set; }
        public DateTime CreatedOn { get; set; }
    }
}
