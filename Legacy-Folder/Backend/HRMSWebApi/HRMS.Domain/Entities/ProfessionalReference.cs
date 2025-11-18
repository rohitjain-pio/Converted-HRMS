namespace HRMS.Domain.Entities
{
    public class ProfessionalReference : BaseEntity
    {
        public long PreviousEmployerId { get; set; }
        public string  FullName { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;

    }
}
