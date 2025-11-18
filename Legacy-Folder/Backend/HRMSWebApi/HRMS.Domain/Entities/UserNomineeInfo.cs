namespace HRMS.Domain.Entities
{
    public class UserNomineeInfo : BaseEntity
    {      
        public string NomineeName { get; set; } = string.Empty;
        public long EmployeeId { get; set; }
        public DateOnly DOB { get; set; }
        public int Age { get; set; }
        public bool IsNomineeMinor { get; set; }
        public string CareOf { get; set; } = string.Empty;
        public int Relationship { get; set; }
        public int Percentage { get; set; }
        public string? Others { get; set; }
        public string IdProofDocType { get; set; }
        public string FileName { get; set; }
        public string FileOriginalName { get; set; }
    }
}
