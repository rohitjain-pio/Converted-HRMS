using Microsoft.AspNetCore.Http;

namespace HRMS.Application
{
    public class FeedbackRequestDto
    {
        public long EmployeeId { get; set; }
        public byte FeedbackType { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public IFormFile? Attachment { get; set; }
    }
}