using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class AssignGoalByManagerRequestDto
    {
        public long GoalId { get; set; }
        public long EmployeeId { get; set; }
        public string? AllowedQuarter { get; set; }
        public string? TargetExpected { get; set; }
        public long? PlanId { get; set; }
    }
}
