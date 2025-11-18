namespace HRMS.Domain.Entities
{
    public class UserQualificationInfo : BaseEntity
    {
        public long EmployeeId { get; set; }
        public long QualificationId { get; set; }
        public string CollegeUniversity { get; set; } = string.Empty;
        public double AggregatePercentage { get; set; }
        public string DegreeName { get; set; } = string.Empty;
        public string StartYear { get; set; }
        public string EndYear { get; set; }
        public string FileName { get; set; }
        public string FileOriginalName { get; set; }

    }
}
