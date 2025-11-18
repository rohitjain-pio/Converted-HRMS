using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class PreviousEmployerDocRequestDto
    {
        public long PreviousEmployerId { get; set; }
        public int EmployerDocumentTypeId { get; set; }
        public IFormFile? File { get; set; }
    }
}
