using HRMS.Models.Models.Downtown;
using HRMS.Models.Models.SystemNotification;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Application.Clients.Interfaces
{
    public interface IEmailClient
    {
        Task<EmailResponse?> SendEmailAsync(EmailRequest emailRequest);
    }
}
