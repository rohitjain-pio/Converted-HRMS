using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Survey
{
    public class SurveyResponseDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string FormIoReferenceId { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string SurveyJson { get; set; } = string.Empty;
        public DateTime PublishDate { get; set; } 
        public DateTime DeadLine { get; set; }
    }
}
