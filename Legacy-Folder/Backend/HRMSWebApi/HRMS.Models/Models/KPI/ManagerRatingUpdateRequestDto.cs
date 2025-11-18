using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class ManagerRatingUpdateRequestDto
    {
        public long PlanId { get; set; }
         public long GoalId { get; set; }
        public decimal ManagerRating { get; set; }
        public string? ManagerNote { get; set; }

    }
}
