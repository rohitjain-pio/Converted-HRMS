namespace HRMS.Domain.Entities
{
    public class Event : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public long EventCategoryId { get; set; }
        public long EmpGroupId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string BannerFileName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string EventUrl1 { get; set; } = string.Empty;
        public string EventUrl2 { get; set; } = string.Empty;
        public string EventUrl3 { get; set; } = string.Empty;
        public bool IsActive { get; set; }       
        public string Venue { get; set; } = string.Empty;
        public int StatusId { get; set; }
        public string EventFeedbackSurveyLink { get; set; } = string.Empty;
    }
}
