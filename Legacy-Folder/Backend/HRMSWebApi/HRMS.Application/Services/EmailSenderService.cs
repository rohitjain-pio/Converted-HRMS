

using HRMS.Application.Services.Interfaces;

namespace HRMS.Application.Services
{
    public class EmailSenderService : IEmailSenderService
    {
        public Task SendEmailAsync(string to, string subject, string body)
        {
            throw new NotImplementedException();
        }
    }
}
