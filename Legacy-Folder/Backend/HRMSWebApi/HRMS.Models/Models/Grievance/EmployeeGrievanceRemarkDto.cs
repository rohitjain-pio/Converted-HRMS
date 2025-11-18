using HRMS.Domain.Enums;
namespace HRMS.Models.Models.Grievance
{
    public class EmployeeGrievanceRemarkDto
    {
        public string? RemarkOwnerName { get; set; }
        public string? RemarkOwnerEmail { get; set; }
        public string? RemarkOwnerAvatar { get; set; }
        public long? RemarkOwnerEmpId { get; set; }
        public string Remarks { get; set; }
        public string? AttachmentPath { get; set; }
        public string? FileOriginalName { get; set; }
        public GrievanceStatus Status { get; set; }
        public DateTime CreatedOn { get; set; }
        public int Level { get; set; }

    }


}
