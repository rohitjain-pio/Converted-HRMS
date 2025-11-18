namespace HRMS.Domain.Entities
{
    public class PreviousEmployerDocument : BaseEntity
    {
        public long PreviousEmployerId { get; set; }
        public int EmployerDocumentTypeId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileOriginalName { get; set; } = string.Empty;
    }
}
