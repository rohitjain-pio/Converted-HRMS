using Microsoft.AspNetCore.Http;

namespace HRMS.Application
{
    public class FeedbackByEmployeeResponseDto
    {
        public long Id { get; set; }
        public int TicketStatus { get; set; }
        public int FeedbackType { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public string? AdminComment { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }
}