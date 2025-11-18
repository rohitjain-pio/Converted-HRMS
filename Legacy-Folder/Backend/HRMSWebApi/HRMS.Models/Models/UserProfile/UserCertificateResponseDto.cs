using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class UserCertificateResponseDto
    {
        public long Id { get; set; }
        public long EmployeeId { get; set; }
        public string CertificateName { get; set; } = String.Empty;
        public string FileName { get; set; } = String.Empty;
        public string OriginalFileName { get; set; } = String.Empty;
        public DateOnly? CertificateExpiry { get; set; }
    }
}
