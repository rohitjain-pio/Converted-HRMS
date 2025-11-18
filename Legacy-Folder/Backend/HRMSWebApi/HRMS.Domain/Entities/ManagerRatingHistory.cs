namespace HRMS.Domain.Entities
{
    public class ManagerRatingHistory : BaseEntity
    {
        public long PlanId { get; set; }
        public long GoalId { get; set; }
        public long ManagerId { get; set; }
        public decimal? ManagerRating { get; set; }
        public string? ManagerComment { get; set; }
    }
}