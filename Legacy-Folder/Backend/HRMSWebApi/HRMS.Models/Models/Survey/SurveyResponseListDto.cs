using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Survey
{
    public class SurveyResponseListDto
    {
        public long SurveyId { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime? PublishDate { get; set; }
        public DateTime? DeadLine { get; set; }
        public string GroupName { get; set; }
        public int EmpGroupId { get; set; }
        public string StatusValue { get; set; }
        public int StatusId { get; set; }
       
    }
}
