namespace HRMS.Models.Models.NotificationTemplate
{
    public class EmailTemplateSearchResponseDto
    {
        public EmailTemplateSearchResponseDto()
        {
            emailTemplates = new List<EmailTemplateResponseDto>();
        }
        public IEnumerable<EmailTemplateResponseDto> emailTemplates { get; set; }
        public int TotalRecords { get; set; }
    }
}
