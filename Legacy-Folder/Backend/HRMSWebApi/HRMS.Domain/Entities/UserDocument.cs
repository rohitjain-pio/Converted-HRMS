namespace HRMS.Domain.Entities
{
    public class UserDocument : BaseEntity
    {
        public long EmployeeId { get; set; }
        public string DocumentName { get; set; } = string.Empty;
        public long DocumentTypeId { get; set; }
        public string DocumentNumber { get; set; } = string.Empty;
        public DateOnly? DocumentExpiry { get; set; }
        public string Location { get; set; } = string.Empty;

    }
}
