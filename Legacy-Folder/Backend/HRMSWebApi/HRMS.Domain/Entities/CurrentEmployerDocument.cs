namespace HRMS.Domain.Entities
{
    public class CurrentEmployerDocument : BaseEntity
    {
        public long EmployeeId { get; set; }
        public int EmployeeDocumentTypeId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileOriginalName { get; set; } = string.Empty;
    }
}