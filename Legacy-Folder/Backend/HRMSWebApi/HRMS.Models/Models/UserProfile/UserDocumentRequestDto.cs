using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class UserDocumentRequestDto
    {
        public long Id { get; set; }
        public long EmployeeId { get; set; }
        public long DocumentTypeId { get; set; }
        public string DocumentNumber { get; set; } = string.Empty;
        public DateOnly? DocumentExpiry { get; set; }
        public IFormFile? File { get; set; }
    }
}
