namespace HRMS.Application
{
    public class FeedbackByEmployeeListResponseDto
    {
        public int TotalRecords { get; set; }
        public List<FeedbackByEmployeeResponseDto> FeedbackList { get; set; } = new List<FeedbackByEmployeeResponseDto>();

    }
}