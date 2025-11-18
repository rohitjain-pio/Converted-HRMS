using HRMS.Application.Clients.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Domain.Utility;
using HRMS.Models.Models.Downtown;
using HRMS.Models.Models.SystemNotification;
using Microsoft.Extensions.Configuration;

namespace HRMS.Application.Clients
{
    public class EmailNotificationClient :BaseHttpClient, IEmailClient
    {
        private readonly IConfiguration _configuration;
        public EmailNotificationClient(HttpClient httpClient,IConfiguration configuration):base(httpClient)
        {
            _configuration = configuration;
        }
       public async Task<EmailResponse?> SendEmailAsync(EmailRequest emailRequest)
        {
            var payload = new
            {
                to = emailRequest.To,
                cc = emailRequest.CC,
                subject = emailRequest.Subject,
                body = emailRequest.Body
            };
            var token = _configuration["HttpClientsUrl:EmailNotificationApiToken"];
            var response = await Post<DowntownResponse<EmailResponse>>(content: payload, ClientType.EmailNotificationClient, ApiEndPoints.EmailNotificationURI, token:token);
            // since we're using status & message of the container obj.
            response.data.Status = response.status;
            response.data.Message = response.message;
            return response.data;
        }
    }
}

