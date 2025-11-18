using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Grievance
{



    public class EmployeeListGrievanceResponseDto
    {
        public int Id { get; set; }
        public string TicketNo { get; set; } = null!;
        public int GrievanceTypeId { get; set; }
        public string GrievanceTypeName { get; set; } = null!;
        public GrievanceStatus Status { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public string? ResolvedBy { get; set; } = "Not Yet Resolved";
        public DateTime? ResolvedDate { get; set; }
        public byte Level { get; set; }
        public TatStatus TatStatus { get; set; }
    }
}