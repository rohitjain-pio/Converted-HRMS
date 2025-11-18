namespace HRMS.Domain.Entities
{
    public class Feedback : BaseEntity
    {
        public long EmployeeId { get; set; }
        public byte TicketStatus { get; set; }
        public byte FeedbackType { get; set; }
        public string Subject { get; set; } 
        public string Description { get; set; }
        public string? AdminComment { get; set; }
        public string? AttachmentPath { get; set; }
        public string? FileOriginalName { get; set; }
    }
}