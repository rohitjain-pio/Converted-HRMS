namespace HRMS.Domain.Entities
{
    public class Survey : BaseEntity
    {       
        public string Title { get; set; } = string.Empty;        
        public string Description { get; set; } = string.Empty;       
        public string SurveyJson{ get; set; } = string.Empty;     
        public string FormIoReferenceId { get; set; } = string.Empty;
        public int StatusId { get; set; }
        public DateTime PublishDate { get; set; }
        public DateTime DeadLine { get; set; }
        public long ResponsesCount { get; set; }
       

    }
}
