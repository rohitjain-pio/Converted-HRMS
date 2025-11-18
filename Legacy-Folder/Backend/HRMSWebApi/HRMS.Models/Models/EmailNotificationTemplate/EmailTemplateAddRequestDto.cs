using System.ComponentModel;

namespace HRMS.Models.Models.NotificationTemplate
{
   public class EmailTemplateAddRequestDto
    {       
        public string TemplateName { get; set; } = string.Empty;    
        public string Subject { get; set; } = string.Empty; 
        public string Content { get; set; } = string.Empty;
        [DefaultValue(false)]
        public bool IsDisabled { get; set; } = false;
    }
}
