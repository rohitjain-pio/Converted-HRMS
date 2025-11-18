using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class GoalRequestDto
    {
        public long Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public long DepartmentId { get; set; }
        public string? EmployeeIds { get; set; } = string.Empty;    
    }
}
