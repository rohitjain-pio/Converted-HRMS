namespace HRMS.Models.Models.Grievance
{
    public class EmployeeGrievanceDetail
    {
        public string TicketNo { get; set; }
        public string GrievanceTypeName { get; set; }
        public long GrievanceTypeId { get; set; }
        public int Level { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int Status { get; set; }
        public string requesterName { get; set; }
        public string requesterEmail { get; set; }
        public string requesterAvatar { get; set; }
        public string ManageBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime? ResolvedDate { get; set; }
        public string? AttachmentPath { get; set; }
        public string? FileOriginalName { get; set; }

    }

}