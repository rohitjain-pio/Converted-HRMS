using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class UserCertificateRequestDto
    {
        public int Id { get; set; }
        public long EmployeeId { get; set; }
        public string CertificateName { get; set; }
        public IFormFile? File { get; set; }
        public DateOnly? CertificateExpiry { get; set; }
    }
}
