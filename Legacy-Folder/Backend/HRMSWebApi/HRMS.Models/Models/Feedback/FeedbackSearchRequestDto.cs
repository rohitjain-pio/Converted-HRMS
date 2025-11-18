using Microsoft.AspNetCore.Http;

namespace HRMS.Application
{
    public class FeedbackSearchRequestDto
    {
        public string? EmployeeCodes { get; set; }
        public DateOnly? CreatedOnFrom { get; set; }
        public DateOnly? CreatedOnTo { get; set; }
        public int? FeedbackType { get; set; }
        public int? TicketStatus { get; set; }
        public string? SearchQuery { get; set; }
    }

}