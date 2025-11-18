using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.SystemNotification
{
    public class EmailNotification
    {
        public long Id { get; set; }
        public long TemplateId { get; set; }
        public string ToEmail { get; set; } = string.Empty;
        public string FromEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string CC { get; set; } = string.Empty;
        public int SentStatus { get; set; }
        public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
        public DateTime? SentOn { get; set; }
    }
}
