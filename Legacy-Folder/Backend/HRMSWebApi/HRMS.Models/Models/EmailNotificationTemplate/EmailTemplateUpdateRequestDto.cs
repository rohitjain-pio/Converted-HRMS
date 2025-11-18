using HRMS.Domain.Enums;

namespace HRMS.Models.Models.NotificationTemplate
{
    public class EmailTemplateUpdateRequestDto
    {
        public long Id { get; set; }
        public string TemplateName { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public EmailTemplateTypes Type { get; set; }
        public EmailTemplateStatus? Status { get; set; } = null;
        public string SenderName { get; set; } = string.Empty;
        public string SenderEmail { get; set; } = string.Empty;
        public string CCEmails { get; set; } = string.Empty;
        public string BCCEmails { get; set; } = string.Empty;
        public string ToEmail { get; set; } = string.Empty;      
    }
}
