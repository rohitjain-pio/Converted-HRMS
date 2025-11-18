using HRMS.Application.Services.Interfaces;
using Quartz;

namespace HRMS.API.Job
{
    public class SendEmailNotificationJob : IJob
    {
        private readonly IEmailNotificationService _emailNotificationService;
        public SendEmailNotificationJob(IEmailNotificationService emailNotificationService)
        {
            _emailNotificationService = emailNotificationService;
        }
        public async Task Execute(IJobExecutionContext context)
        {
           await _emailNotificationService.AddBirthdayEmailAsync();          
           await _emailNotificationService.AddWorkAnniversaryEmailAsync();                    
        }    
    }
}
