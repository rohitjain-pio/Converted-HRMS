using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class DesignationSearchRequestDto
    {
        public string Designation { get; set; } = default!;
        public bool? Status { get; set; }
    }
}
