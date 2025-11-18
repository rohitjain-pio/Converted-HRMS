using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Domain.Configurations
{
    public class SystemEmailConfig
    {
        public BithdayNotification BithdayNotification { get; set; } = new();
        public AnniversaryNotification AnniversaryNotification { get; set; } = new();
        public WelcomeNotification WelcomeNotification { get; set; } = new();
    }
    public class BithdayNotification
    {
        public string FromEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string CC { get; set; } = string.Empty;
    }
    public class AnniversaryNotification
    {
        public string FromEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string CC { get; set; } = string.Empty;
    }
    public class WelcomeNotification
    {
        public string FromEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string CC { get; set; } = string.Empty;
    }
}
