using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Options;
using HRMS.Domain;
using HRMS.Application.Clients.Interfaces;
using HRMS.Models.Models.SystemNotification;
using HRMS.Domain.Contants;
using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

namespace HRMS.Application.Clients.EmailQueue
{
    public class EmailClientSmtpPooled : IEmailClient, IDisposable
    {
        private readonly EmailSMTPSettings _emailSettings;
        private readonly ConcurrentQueue<SmtpClient> _connectionPool = new();
        private readonly SemaphoreSlim _poolSemaphore;
        private volatile bool _disposed = false;
        private readonly IBackgroundTaskQueue _taskQueue;
        private readonly ILogger _logger;
        private readonly TimeSpan _timeout = TimeSpan.FromSeconds(60); // connection timeout

        public EmailClientSmtpPooled(IOptions<EmailSMTPSettings> emailSettings, IBackgroundTaskQueue taskQueue, ILogger logger)
        {
            _emailSettings = emailSettings.Value;
            var _maxPoolSize = _emailSettings.MaxConcurrentConnections;
            _poolSemaphore = new SemaphoreSlim(_maxPoolSize, _maxPoolSize);
            _taskQueue = taskQueue;
            _logger = logger;
        }
        public async Task<EmailResponse?> SendEmailAsync(EmailRequest emailRequest)
        {
            await _taskQueue.QueueBackgroundWorkItemAsync(async token =>
            {
                await SendEmailInternalAsync(emailRequest);
            });

            return new EmailResponse
            {
                Status = true,
                Message = "Email queued for processing"
            };
        }

        private async Task<EmailResponse?> SendEmailInternalAsync(EmailRequest emailRequest)
        {
            if (_disposed)
                throw new ObjectDisposedException(nameof(EmailClientSmtpPooled));

            SmtpClient? smtp = null;
            try
            {
                smtp = await GetSmtpClientAsync();

                var email = CreateMimeMessage(emailRequest);
                await smtp.SendAsync(email);
                Console.WriteLine("Sending : " + email.ToString());

                return new EmailResponse
                {
                    Message = SuccessMessage.Success,
                    Status = true
                };
            }
            catch (Exception ex)
            {
                // Don't return connection to pool if it failed

                smtp = null;

                _logger.LogError(ex, "Failed in {0}", nameof(SendEmailInternalAsync));

                return new EmailResponse
                {
                    Message = ex.Message,
                    Status = false
                };
            }
            finally
            {
                if (smtp != null)
                {
                    ReturnSmtpClientToPool(smtp);
                }
            }
        }

        private async Task<SmtpClient> GetSmtpClientAsync()
        {
            if (!await _poolSemaphore.WaitAsync(_timeout))
            {
                _logger.LogError($"SMTP connection timeout. Pool size: {_connectionPool.Count}, Available permits: {_poolSemaphore.CurrentCount}");
                throw new TimeoutException("Could not acquire SMTP connection within timeout period");
            }
            try
            {
                if (_connectionPool.TryDequeue(out var smtp))
                {
                    if (smtp.IsConnected && smtp.IsAuthenticated)
                    {
                        try
                        {
                            await smtp.NoOpAsync();
                            return smtp;
                        }
                        catch (Exception)
                        {
                            smtp.Dispose();
                        }
                    }
                    else
                        smtp.Dispose();
                }

                smtp = new SmtpClient();
                await smtp.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort, SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_emailSettings.Username, _emailSettings.Password);

                return smtp;
            }
            catch
            {
                _poolSemaphore.Release();
                throw;
            }
        }

        private void ReturnSmtpClientToPool(SmtpClient smtp)
        {
            try
            {
                if (!_disposed && smtp.IsConnected && smtp.IsAuthenticated)
                {
                    _connectionPool.Enqueue(smtp);
                }
                else
                {
                    smtp.Dispose();
                }
            }
            finally
            {
                _poolSemaphore.Release();
            }
        }

        private MimeMessage CreateMimeMessage(EmailRequest emailRequest)
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

            // Add CC
            if (emailRequest.CC != null)
            {
                foreach (var cc in emailRequest.CC)
                {
                    if (!string.IsNullOrWhiteSpace(cc))
                        email.Cc.Add(MailboxAddress.Parse(cc));
                }
            }

            // Add BCC
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

            return email;
        }

        public void Dispose()
        {
            if (_disposed)
                return;

            _disposed = true;

            // Dispose all connections in pool
            while (_connectionPool.TryDequeue(out var smtp))
            {
                try
                {
                    if (smtp.IsConnected)
                        smtp.Disconnect(true);
                    smtp.Dispose();
                }
                catch
                {
                    // Ignore disposal errors
                }
            }

            _poolSemaphore?.Dispose();
        }
    }
}