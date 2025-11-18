using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Survey
{
    public class SurveyAnswerRequestDto
    {
        public long Id { get; set; }
        public long EmployeeId { get; set; }
        public long SurveyId { get; set; }
        public string SurveyJsonResponse { get; set; } = string.Empty;

    }
}
