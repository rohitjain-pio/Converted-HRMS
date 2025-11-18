using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.UserProfile
{
    public class DepartmentClearanceResponseDto
    {
        public int ResignationId { get; set; }
        public KTStatus KTStatus { get; set; } 
        public string KTNotes { get; set; }
        public string Attachment { get; set; }
        public List<int> KTUsers { get; set; }
    }
}
