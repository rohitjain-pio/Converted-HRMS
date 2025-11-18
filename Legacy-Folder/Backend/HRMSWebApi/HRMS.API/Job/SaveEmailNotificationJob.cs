using HRMS.Application.Services.Interfaces;
using Quartz;

namespace HRMS.API.Job
{
    public class SaveEmailNotificationJob:IJob
    {
        private readonly IEmailNotificationService _emailNotificationService;
        public SaveEmailNotificationJob(IEmailNotificationService emailNotificationService)
        {
            _emailNotificationService = emailNotificationService;
        }
        public async Task Execute(IJobExecutionContext context)
        {
            //await _emailNotificationService.AddBirthdayEmailAsync();
            //await _emailNotificationService.AddWorkAnniversaryEmailAsync();
           // await _emailNotificationService.AddWelcomeEmailAsync("sudheesh.oottuparambil@programmers.io");
        }
    }
}
