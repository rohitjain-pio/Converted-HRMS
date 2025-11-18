using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
    public class GrievanceRemarks : BaseEntity
    {

        public long TicketId { get; set; }
        public string Remarks { get; set; } = null!;
        public int OwnerId { get; set; }
        public string? AttachmentPath { get; set; }
        public string? FileOriginalName { get; set; }
        public GrievanceStatus Status { get; set; }
    }
}