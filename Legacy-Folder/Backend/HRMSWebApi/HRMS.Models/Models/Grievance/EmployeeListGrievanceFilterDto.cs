using HRMS.Domain.Enums;


namespace HRMS.Models.Models.Grievance
{
    public class EmployeeListGrievanceFilterDto
    {
        public int? GrievanceTypeId { get; set; }
        public GrievanceStatus? Status { get; set; }
        public DateOnly? CreatedOnFrom { get; set; }
        public DateOnly? CreatedOnTo { get; set; }
        public DateOnly? ResolvedDate { get; set; }
        public int? Level { get; set; }
        public TatStatus? TatStatus { get; set; }
        public string? CreatedBy { get; set; }
        public long? ResolvedBy { get; set; }
        
    }
}



