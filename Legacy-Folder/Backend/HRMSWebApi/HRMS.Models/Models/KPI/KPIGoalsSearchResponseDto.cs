using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.KPI
{
    public class KPIGoalsSearchResponseDto
    {
        public int TotalRecords { get; set; }
        public List<GoalResponseDto> GoalList { get; set; } = new List<GoalResponseDto>();

            
    }
}
