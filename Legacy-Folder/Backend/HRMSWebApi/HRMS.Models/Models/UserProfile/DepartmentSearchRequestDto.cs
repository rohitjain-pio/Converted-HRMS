using HRMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class DepartmentSearchRequestDto
    {
        public string Department { get; set; } = default!;
        public bool? Status { get; set; } 
    }
}
