using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class PreviousEmployerSearchDto
    {
        public long? Id { get; set; } = default!;
        public string EmployerName { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public List<PreviousEmployerSearchDocumentDto>? Documents { get; set; } = new();
        public List<ProfessionalReferenceSearchDto>? ProfessionalReferences { get; set; } = new();
    }
}
