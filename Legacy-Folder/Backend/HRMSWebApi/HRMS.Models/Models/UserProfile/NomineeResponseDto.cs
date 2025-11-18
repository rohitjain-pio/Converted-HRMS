using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class NomineeResponseDto
    {
        public long? Id { get; set; } = default!;
        public string NomineeName { get; set; } = default!;       
        public DateOnly DOB { get; set; }
        public int Age { get; set; }
        public string? CareOf { get; set; }
        public string? Others { get; set; }
        public int Percentage { get; set; }
        public bool IsNomineeMinor { get; set; }
        public int RelationshipId { get; set; }
        public string RelationshipName { get; set; } = default!;
        public string CreatedBy {  get; set; } = default!;
        public DateTime CreatedOn { get; set; }
        public string? ModifiedBy {  get; set; }
        public DateTime? ModifiedOn { get; set; }
        public string FileName { get; set; }
        public string FileOriginalName { get; set; }
        public int IdProofDocType { get; set; }
        public string IdProofDocName { get; set; }
    }
}
