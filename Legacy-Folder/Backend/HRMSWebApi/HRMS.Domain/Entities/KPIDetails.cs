namespace HRMS.Domain.Entities
{
    public class KPIDetails : BaseEntity
    {
        public long PlanId { get; set; }
        public long GoalId { get; set; }

        public decimal? Q1_Rating { get; set; }
        public decimal? Q2_Rating { get; set; }
        public decimal? Q3_Rating { get; set; }
        public decimal? Q4_Rating { get; set; }

        public string? Q1_Note { get; set; }
        public string? Q2_Note { get; set; }
        public string? Q3_Note { get; set; }
        public string? Q4_Note { get; set; }

        public string? TargetExpected { get; set; }

        public decimal? EmployeeRating { get; set; }
        public decimal? ManagerRating { get; set; }

        public string? EmployeeNote { get; set; }
        public string? ManagerNote { get; set; }
        public bool? Status { get; set; } = false;
        public string? AllowedQuarter { get; set; }
    }
}
