using HRMS.Domain.Enums;

namespace HRMS.Models.Models.NotificationTemplate
{
    public class EmailTemplateSearchRequestDto
    {
        public string? TemplateName { get; set; } = null;
        public string? SenderName { get; set; } = null;
        public string? SenderEmail { get; set; } = null;
        public EmailTemplateTypes? TemplateType { get; set; } = null;
    }
}
