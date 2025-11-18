using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Models.Models.UserProfile;


namespace HRMS.Models.Models.Event
{
    public class EventResponseDto
    {
        public long Id { get; set; }
        public string EventName { get; set; } = string.Empty;
        public string EmployeeGroup { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public string StartTime { get; set; } = string.Empty;
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Link1 { get; set; } = string.Empty;
        public string Link2 { get; set; } = string.Empty;
        public string Link3 { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; } = string.Empty;
        public string Venue { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;

        public string BannerFileName { get; set; } = string.Empty;
        public string EventFeedbackSurveyLink { get; set; } = string.Empty;
        public int EmpGroupId { get; set; }
        public int EventCategoryId { get; set; }
        public int StatusId { get; set; }


        public IEnumerable<EventDocumentResponseDto> eventDocument { get; set; } 
        
    }
}