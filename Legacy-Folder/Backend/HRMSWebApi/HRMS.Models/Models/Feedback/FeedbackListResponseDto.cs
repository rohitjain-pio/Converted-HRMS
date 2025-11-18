using Microsoft.AspNetCore.Http;

namespace HRMS.Application
{
    public class FeedbackListResponseDto
    {
        public int TotalRecords { get; set; }
        public List<FeedbackResponseDto> FeedbackList { get; set; } = new List<FeedbackResponseDto>();
    }
}