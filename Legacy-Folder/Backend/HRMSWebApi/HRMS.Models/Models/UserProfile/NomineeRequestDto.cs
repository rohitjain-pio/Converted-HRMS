using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class NomineeRequestDto
    {
        public long? Id { get; set; } = default!;
        public string NomineeName { get; set; } = default!;
        public long EmployeeId { get; set; }
        public DateOnly DOB {  get; set; }
        public int Age { get; set; }
        public string? CareOf {  get; set; }
        public int Relationship { get; set; }
        public string? Others {  get; set; }
        public int Percentage { get; set; }
        public IFormFile? File { get; set; }
        public int IdProofDocType { get; set; }

    }
}
