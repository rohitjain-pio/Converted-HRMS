using Microsoft.AspNetCore.Http;

namespace HRMS.Application
{
    public class FeedbackResponseDto
    {
        public long Id { get; set; }
        public long EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeEmail { get; set; }
        public byte TicketStatus { get; set; }
        public byte FeedbackType { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public string? AdminComment { get; set; }
        public string? AttachmentPath { get; set; }
        public string? FileOriginalName { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? ModifiedOn { get; set; }
    }
}