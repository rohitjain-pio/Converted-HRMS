using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
    public class EmployeeGrievance : BaseEntity
    {
        public string TicketNo { get; set; } = string.Empty;
        public int GrievanceTypeId { get; set; }
        public byte Level { get; set; }
        public long EmployeeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? AttachmentPath { get; set; }
        public GrievanceStatus Status { get; set; }
        public bool? TatStatus { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public string? FileOriginalName { get; set; }

    }
}
