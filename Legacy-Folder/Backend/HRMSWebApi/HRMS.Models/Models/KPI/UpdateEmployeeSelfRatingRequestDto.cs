using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class UpdateEmployeeSelfRatingRequestDto
    {
        public long goalId { get; set; }
        public long PlanId { get; set; }
        public string? note { get; set; }
        public string? quarter { get; set; }
        public decimal? rating { get; set; }
        public string? AllowedQuarter { get; set; } 
        public string? TargetExpected { get; set; }     
    }
}
