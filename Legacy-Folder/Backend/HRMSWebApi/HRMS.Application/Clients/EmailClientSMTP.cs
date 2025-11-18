
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Options;
using HRMS.Domain;
using HRMS.Application.Clients.Interfaces;
using HRMS.Models.Models.SystemNotification;
using HRMS.Domain.Contants;

namespace HRMS.Application.Clients
{
    public class EmailClientSmtp : IEmailClient
    {
        private readonly EmailSMTPSettings _emailSettings;

        public EmailClientSmtp(IOptions<EmailSMTPSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }

        public async Task<EmailResponse?> SendEmailAsync(EmailRequest emailRequest)
        {
            var email = new MimeMessage();

            email.Sender = MailboxAddress.Parse(_emailSettings.SenderEmail);
            email.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));

            // Add TO
            foreach (var recipient in emailRequest.To)
            {
                if (!string.IsNullOrWhiteSpace(recipient))
                    email.To.Add(MailboxAddress.Parse(recipient));
            }

            //  Add CC
            if (emailRequest.CC != null)
            {
                foreach (var cc in emailRequest.CC)
                {
                    if (!string.IsNullOrWhiteSpace(cc))
                        email.Cc.Add(MailboxAddress.Parse(cc));
                }
            }

            //  Add BCC
            if (emailRequest.BCC != null)
            {
                foreach (var bcc in emailRequest.BCC)
                {
                    if (!string.IsNullOrWhiteSpace(bcc))
                        email.Bcc.Add(MailboxAddress.Parse(bcc));
                }
            }

            email.Subject = emailRequest.Subject;

            var builder = new BodyBuilder
            {
                HtmlBody = emailRequest.Body
            };
            email.Body = builder.ToMessageBody();

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

            return new EmailResponse
            {
                Message = SuccessMessage.Success,
                Status = true
            };
        }

    }
}
