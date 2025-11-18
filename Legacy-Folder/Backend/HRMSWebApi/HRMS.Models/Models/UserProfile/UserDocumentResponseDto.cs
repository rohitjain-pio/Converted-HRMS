using HRMS.Domain.Entities;

namespace HRMS.Models.Models.UserProfile
{
    public class UserDocumentResponseDto 
    {
        public long Id { get; set; }
        public long EmployeeId { get; set; }
        public string DocumentName { get; set; } = string.Empty;
        public long DocumentTypeId { get; set; }
        public string DocumentType { get; set; } = string.Empty;
        public string DocumentNumber { get; set; } = string.Empty;
        public DateOnly? DocumentExpiry { get; set; }
        public string Location { get; set; } = string.Empty;
    }
}
