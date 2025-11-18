using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Survey
{
    public class SurveySearchRequestDto
    {
        public string Title { get; set; }
        public int StatusId { get; set; }
        public int EmpGroupId { get; set; }
    }
}
