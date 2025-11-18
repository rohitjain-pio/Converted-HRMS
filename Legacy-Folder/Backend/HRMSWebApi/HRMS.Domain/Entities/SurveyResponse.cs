namespace HRMS.Domain.Entities
{
    public class SurveyResponse:BaseEntity
    {       
        public long EmployeeId { get; set; }
        public long SurveyId { get; set; }
        public string SurveyJsonResponse { get; set; } = string.Empty;

    }
}
