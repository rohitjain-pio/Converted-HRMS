namespace HRMS.Domain.Entities
{
    public class UserCertificate :BaseEntity
    {
        public long EmployeeId { get; set; }
        public string CertificateName { get; set; }
        public string FileName { get; set; }
        public string OriginalFileName { get; set; }
        public DateOnly? CertificateExpiry { get; set; }

    }
}
