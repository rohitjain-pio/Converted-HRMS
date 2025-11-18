using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.SystemNotification
{
    public class EmailRequest
    {
        public string[] To { get; set; } = Array.Empty<string>();
        public string[] CC { get; set; } = Array.Empty<string>();
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string[] BCC { get; set; } = Array.Empty<string>();
        public string FromEmail { get; set; } = string.Empty;
        public string FromName { get; set; } = string.Empty;

      

    }
}
