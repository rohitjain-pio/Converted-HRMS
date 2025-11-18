using System.ComponentModel.DataAnnotations.Schema;

namespace HRMS.Models.Models.Survey
{
    public class SurveyRequestDto
    {
        public long Id { get; set; }        
        public string Title { get; set; } = string.Empty;        
        public string Description { get; set; } = string.Empty;        
        public string FormIoReferenceId { get; set; } = string.Empty;
        public int StatusId { get; set; }
        public string SurveyJson { get; set; } = string.Empty;
        public DateTime DeadLine { get; set; }      

    }
}
