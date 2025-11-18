using HRMS.Models.Models.NotificationTemplate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Survey
{
    public class SurveySearchResponseDto
    {
        public SurveySearchResponseDto()
        {
            SurveyResponseList = new List<SurveyResponseListDto>();
        }
        public IEnumerable<SurveyResponseListDto> SurveyResponseList { get; set; }
        public int TotalRecords { get; set; }
    }
}

