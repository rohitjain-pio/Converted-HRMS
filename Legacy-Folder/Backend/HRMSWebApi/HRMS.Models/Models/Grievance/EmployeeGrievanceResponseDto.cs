using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Grievance
{



    public class EmployeeGrievanceResponseDto
    {
        public int Id { get; set; }
        public int GrievanceTypeId { get; set; }
        public string GrievanceTypeName { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime CreatedOn { get; set; }
        public string TicketNo { get; set; } = null!;
        public byte Level { get; set; }
        public GrievanceStatus Status { get; set; }
        public  string ManageBy { get; set; }
    }
}