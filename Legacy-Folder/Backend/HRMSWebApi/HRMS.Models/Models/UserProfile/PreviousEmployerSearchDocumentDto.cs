using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class PreviousEmployerSearchDocumentDto
    {
        public long? Id { get; set; } = default!;
        public string DocumentName { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FileOriginalName { get; set; } = string.Empty;
        public int EmployerDocumentTypeId { get; set; }
    }
}
