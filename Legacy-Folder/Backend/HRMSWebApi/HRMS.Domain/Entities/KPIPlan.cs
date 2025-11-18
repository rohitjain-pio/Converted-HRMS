namespace HRMS.Domain.Entities
{
    public class KPIPlan : BaseEntity
    {
        public long EmployeeId { get; set; }
        public string? AppraisalCycle { get; set; }
        public bool? IsReviewed { get; set; }
        public DateTime? ReviewDate { get; set; }
        public string? OverallProgress { get; set; }
        public string? AppraisalNote { get; set; }
        public string? AppraisalAttachment { get; set; }

    }
}
