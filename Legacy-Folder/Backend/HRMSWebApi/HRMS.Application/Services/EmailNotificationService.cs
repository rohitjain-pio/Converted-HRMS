using HRMS.Application.Services.Interfaces;
using HRMS.Infrastructure;
using HRMS.Domain.Enums;
using HRMS.Models.Models.SystemNotification;
using HRMS.Domain.Utility;
using HRMS.Domain.Configurations;
using Microsoft.Extensions.Options;
using HRMS.Application.Clients.Interfaces;
using System.Reflection;
using System.ComponentModel;
using HRMS.Models.Models.Employees;
using HRMS.Domain.Contants;
using HRMS.Domain;
using Microsoft.Extensions.Configuration;

namespace HRMS.Application.Services
{
    public class EmailNotificationService : IEmailNotificationService
    {
        private readonly IUnitOfWork _unitOfWork;

        private readonly SystemEmailConfig _systemEmailConfig;
        private readonly IEmailClient _emailClient;
        private readonly IConfiguration _configuration;


        public EmailNotificationService(IConfiguration configuration, IUnitOfWork unitOfWork, IOptions<SystemEmailConfig> systemEmailConfig, IEmailClient emailClient)
        {
            _unitOfWork = unitOfWork;
            _systemEmailConfig = systemEmailConfig.Value;
            _emailClient = emailClient;
            _configuration = configuration;

        }
        public async Task AddBirthdayEmailAsync()
        {
            var birthdayTemplate = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.Birthday);

            var birthdayData = await _unitOfWork.EmailNotificationRepository.GetBithdayData();

            if (birthdayData != null && birthdayData.Any())
            {
                foreach (var item in birthdayData)
                {
                    string body = ReplacePlaceholders(birthdayTemplate.Content, item);
                    var emailRequest = new EmailRequest
                    {
                        To = new[] { item.Email },
                        CC = birthdayTemplate.CCEmails?.Split(';') ?? Array.Empty<string>(),
                        BCC = birthdayTemplate.BCCEmails?.Split(';') ?? Array.Empty<string>(),
                        FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                        FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                        Subject = $"{_systemEmailConfig.BithdayNotification.Subject} {item.FirstName} {item.LastName}",
                        Body = body
                    };


                    await _emailClient.SendEmailAsync(emailRequest);
                }
            }
        }

        public async Task AddWorkAnniversaryEmailAsync()
        {
            var anniversaryTemplate = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.Anniversary);
            var anniversaryData = await _unitOfWork.EmailNotificationRepository.GetAnniversaryData();

            if (anniversaryTemplate != null && anniversaryData != null && anniversaryData.Any())
            {
                foreach (var item in anniversaryData)
                {
                    item.OrdinalSuffix = Helper.GetOrdinalSuffix(item.YearsOfService);
                    string body = ReplacePlaceholders(anniversaryTemplate.Content, item);
                    var emailRequest = new EmailRequest
                    {
                        To = new[] { item.Email },
                        CC = anniversaryTemplate.CCEmails?.Split(';') ?? Array.Empty<string>(),
                        BCC = anniversaryTemplate.BCCEmails?.Split(';') ?? Array.Empty<string>(),
                        FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                        FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                        Subject = $"{_systemEmailConfig.AnniversaryNotification.Subject} {item.FirstName} {item.LastName}",
                        Body = body
                    };


                    await _emailClient.SendEmailAsync(emailRequest);

                }
            }
        }
        public async Task AddWelcomeEmailAsync(string email)
        {
            var welcomeTemplate = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.Welcome);
            var welcomeData = await _unitOfWork.EmailNotificationRepository.GetWelcomeData(email);



            if (welcomeTemplate != null && welcomeData != null && welcomeData.Any())
            {
                foreach (var item in welcomeData)
                {
                    string Branch = Helper.GetEnumDescription(item.Branch);
                    string fullTemplate = welcomeTemplate.Content
                        .Replace(EmailPlaceholders.Branch, Branch ?? "");

                    string body = ReplacePlaceholders(fullTemplate, item);

                    var emailRequest = new EmailRequest
                    {
                        To = new[] { item.Email },
                        CC = welcomeTemplate.CCEmails?.Split(';') ?? Array.Empty<string>(),
                        BCC = welcomeTemplate.BCCEmails?.Split(';') ?? Array.Empty<string>(),
                        FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                        FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                        Subject = $"{_systemEmailConfig.WelcomeNotification.Subject} {item.FirstName} {item.LastName} :: {item.Designation} :: {item.Departmentname} :: {Branch}",
                        Body = body
                    };

                    await _emailClient.SendEmailAsync(emailRequest);
                }
            }
        }

        public async Task AddResignationApprovedEmailAsync(long resignationId)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.ResignationApproved);
            var resignationData = await _unitOfWork.EmailNotificationRepository.GetApprovedResignationsAsync(resignationId);

            if (template != null && resignationData != null && resignationData.Any())
            {
                foreach (var item in resignationData)
                {
                    // Build CC list including reporting manager email
                    var cc = (template.CCEmails ?? "")
                        .Split(';', StringSplitOptions.RemoveEmptyEntries)
                        .Select(e => e?.Trim())
                        .Append(item.ReportingManagerEmail?.Trim())
                        .Where(e => !string.IsNullOrWhiteSpace(e))

                        .Distinct(StringComparer.OrdinalIgnoreCase)
                        .ToArray();

                    string fullTemplate = template.Content
                        .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                        .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                        .Replace(EmailPlaceholders.LastWorkingDay, item.LastWorkingDay?.ToString(EmailPlaceholders.ShortDate) ?? "");

                    string body = ReplacePlaceholders(fullTemplate, item);

                    var emailRequest = new EmailRequest
                    {
                        To = new[] { item.Email },
                        CC = cc,
                        BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                        FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                        FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                        Subject = template.Subject.Replace("{FirstName}", item.FirstName ?? "").Replace("{LastName}", item.LastName ?? ""),
                        Body = body
                    };

                    await _emailClient.SendEmailAsync(emailRequest);
                }
            }
        }

        public async Task LeaveAppliedEmailAsync(long EmployeeId, int leaveId)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.LeaveApplied);

            var leaveData = await _unitOfWork.EmailNotificationRepository.GetAppliedLeaveAsync(EmployeeId, leaveId);

            LeaveEnum leaveName = (LeaveEnum)leaveId;

            string leaveTypeDescription = leaveName.GetType().GetField(leaveName.ToString())?.GetCustomAttribute<DescriptionAttribute>()?.Description ?? leaveName.ToString();

            var cc = (template?.CCEmails ?? "")
              .Split(';', StringSplitOptions.RemoveEmptyEntries)
              .Select(e => e?.Trim())
              .Append(leaveData.ReportingManagerEmail?.Trim())
              .Where(e => !string.IsNullOrWhiteSpace(e))
              .Cast<string>()
              .Distinct(StringComparer.OrdinalIgnoreCase)
              .ToArray();

            if (template != null && leaveData != null)
            {
                string fullTemplate = template.Content
                    .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.FirstName, leaveData.FirstName ?? "")
                    .Replace(EmailPlaceholders.LastName, leaveData.LastName ?? "")
                    .Replace(EmailPlaceholders.StartDate, leaveData.StartDate.ToString(EmailPlaceholders.ShortDate))
                    .Replace(EmailPlaceholders.EndDate, leaveData.EndDate.ToString(EmailPlaceholders.ShortDate))
                    .Replace(EmailPlaceholders.StartDateSlot, leaveData.StartDateSlot.ToString())
                    .Replace(EmailPlaceholders.EndDateSlot, leaveData.EndDateSlot.ToString())
                    .Replace(EmailPlaceholders.TotalLeaveDays, leaveData.TotalLeaveDays.ToString())
                    .Replace(EmailPlaceholders.LeaveType, leaveTypeDescription);

                string body = ReplacePlaceholders(fullTemplate, leaveData);

                var emailRequest = new EmailRequest
                {
                    To = new[] { leaveData.Email },
                    CC = cc,
                    BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = template.Subject,
                    Body = body
                };

                await _emailClient.SendEmailAsync(emailRequest);
            }
        }
        // Leave Approval 
        public async Task LeaveApprovalEmailAsync(int AppliedLeaveId)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.LeaveApproval);

            var leaveData = await _unitOfWork.EmailNotificationRepository.GetApprovalLeaveAsync(AppliedLeaveId);

            LeaveEnum leaveName = (LeaveEnum)leaveData.LeaveId;

            string leaveTypeDescription = leaveName.GetType().GetField(leaveName.ToString())?.GetCustomAttribute<DescriptionAttribute>()?.Description ?? leaveName.ToString();

            if (template != null && leaveData != null)
            {
                string fullTemplate = template.Content
                    .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.FirstName, leaveData.FirstName ?? "")
                    .Replace(EmailPlaceholders.LastName, leaveData.LastName ?? "")
                    .Replace(EmailPlaceholders.StartDate, leaveData.StartDate.ToString(EmailPlaceholders.ShortDate))
                    .Replace(EmailPlaceholders.EndDate, leaveData.EndDate.ToString(EmailPlaceholders.ShortDate))
                    .Replace(EmailPlaceholders.StartDateSlot, leaveData.StartDateSlot.ToString())
                    .Replace(EmailPlaceholders.EndDateSlot, leaveData.EndDateSlot.ToString())
                    .Replace(EmailPlaceholders.TotalLeaveDays, leaveData.TotalLeaveDays.ToString())
                    .Replace(EmailPlaceholders.CreatedOn, leaveData.CreatedOn.ToString())
                    .Replace(EmailPlaceholders.Reason, leaveData.Reason.ToString())
                    .Replace(EmailPlaceholders.LeaveType, leaveTypeDescription);

                string body = ReplacePlaceholders(fullTemplate, leaveData);

                var emailRequest = new EmailRequest
                {
                    To = new[] { leaveData.Email },
                    CC = template.CCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = template.Subject,
                    Body = body
                };

                await _emailClient.SendEmailAsync(emailRequest);

            }
        }

        public async Task GrievanceResolvedEmailAsync(string TicketNo)
        {

            var grievanceTemplate = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.GrievanceResolved);

            var grievanceData = await _unitOfWork.EmailNotificationRepository.GetGrievanceData(TicketNo);
            if (grievanceData == null || !grievanceData.Any())
                return;

            // 1. Get grievance owner emails (for CC)
            var grievanceOwnerEmails = await _unitOfWork.EmailNotificationRepository.GetGrievanceOwner(TicketNo);
            var ownerEmailList = grievanceOwnerEmails
                                    .Where(e => !string.IsNullOrWhiteSpace(e.OwnerEmail))
                                    .Select(e => e.OwnerEmail)
                                    .Distinct(StringComparer.OrdinalIgnoreCase)
                                    .ToList();

            // 2. Parse template CC emails
            var templateCcEmails = grievanceTemplate?.CCEmails?
                                        .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                                        .Distinct(StringComparer.OrdinalIgnoreCase)
                                        .ToList() ?? new List<string>();

            // 3. Merge both, avoiding duplicates
            var ccRecipients = templateCcEmails
                                .Union(ownerEmailList, StringComparer.OrdinalIgnoreCase)
                                .ToArray();

            foreach (var item in grievanceData)
            {
                string fullTemplate = grievanceTemplate.Content
                    .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.TicketNo, TicketNo);

                string body = ReplacePlaceholders(fullTemplate, item);

                var emailRequest = new EmailRequest
                {
                    To = new[] { item.Email },
                    CC = ccRecipients,
                    BCC = grievanceTemplate?.BCCEmails?
                            .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                            .ToArray() ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = grievanceTemplate.Subject?.Replace("{TicketNo}", TicketNo) ?? "Grievance Resolved",
                    Body = body
                };

                await _emailClient.SendEmailAsync(emailRequest);
            }
        }





        // Leave Rejection 

        public async Task LeaveRejectionEmailAsync(int AppliedLeaveId)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.LeaveRejection);

            var leaveData = await _unitOfWork.EmailNotificationRepository.GetRejectedLeaveAsync(AppliedLeaveId);

            LeaveEnum leaveName = (LeaveEnum)leaveData.LeaveId;
            string leaveTypeDescription = leaveName.GetType().GetField(leaveName.ToString())?.GetCustomAttribute<DescriptionAttribute>()?.Description ?? leaveName.ToString();

            if (template != null && leaveData != null)
            {
                string fullTemplate = template.Content
                    .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.FirstName, leaveData.FirstName ?? "")
                    .Replace(EmailPlaceholders.LastName, leaveData.LastName ?? "")
                    .Replace(EmailPlaceholders.StartDate, leaveData.StartDate.ToString(EmailPlaceholders.ShortDate))
                    .Replace(EmailPlaceholders.EndDate, leaveData.EndDate.ToString(EmailPlaceholders.ShortDate))
                    .Replace(EmailPlaceholders.StartDateSlot, leaveData.StartDateSlot.ToString())
                    .Replace(EmailPlaceholders.EndDateSlot, leaveData.EndDateSlot.ToString())
                    .Replace(EmailPlaceholders.TotalLeaveDays, leaveData.TotalLeaveDays.ToString())
                    .Replace(EmailPlaceholders.CreatedOn, leaveData.CreatedOn.ToString())
                    .Replace(EmailPlaceholders.RejectReason, leaveData.RejectReason ?? "")
                    .Replace(EmailPlaceholders.Reason, leaveData.Reason.ToString())
                    .Replace(EmailPlaceholders.LeaveType, leaveTypeDescription);


                string body = ReplacePlaceholders(fullTemplate, leaveData);

                var emailRequest = new EmailRequest
                {
                    To = new[] { leaveData.Email },
                    CC = template.CCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = template.Subject,
                    Body = body
                };

                await _emailClient.SendEmailAsync(emailRequest);

            }


        }


        public async Task ResignationSubmitted(long EmployeeId)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.ResignationApplied);

            var resignationData = await _unitOfWork.EmailNotificationRepository.GetResignationAsync(EmployeeId);

            if (template != null && resignationData != null)
            {
                string fullTemplate = template.Content
                    .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.FirstName, resignationData.FirstName ?? "")
                    .Replace(EmailPlaceholders.LastName, resignationData.LastName ?? "")
                    .Replace(EmailPlaceholders.Reason, resignationData.Reason ?? "")
                    .Replace(EmailPlaceholders.ResignationDate, resignationData.CreatedOn.ToString(EmailPlaceholders.ShortDate))
                    .Replace(EmailPlaceholders.Department, resignationData.DepartmentName ?? "");


                string body = ReplacePlaceholders(fullTemplate, resignationData);

                var cc = (template.CCEmails ?? "")
                 .Split(';', StringSplitOptions.RemoveEmptyEntries)
                 .Select(e => e?.Trim())
                 .Append(resignationData.ReportingManagerEmail?.Trim())
                 .Where(e => !string.IsNullOrWhiteSpace(e))
                 .Cast<string>()
                 .Distinct(StringComparer.OrdinalIgnoreCase)
                 .ToArray();


                var emailRequest = new EmailRequest
                {
                    To = new[] { resignationData.Email },
                    CC = cc,
                    BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = template.Subject,
                    Body = body
                };

                await _emailClient.SendEmailAsync(emailRequest);
            }



        }

        public async Task ResignationRejected(long resignationId)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.ResignationRejected);

            var resignationData = await _unitOfWork.EmailNotificationRepository.GetResignationByIdAsync(resignationId);

            if (template != null && resignationData != null)
            {
                string fullTemplate = template.Content
                    .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.FirstName, resignationData.FirstName ?? "")
                    .Replace(EmailPlaceholders.LastName, resignationData.LastName ?? "")
                    .Replace(EmailPlaceholders.Reason, resignationData.Reason ?? "")
                    .Replace(EmailPlaceholders.ResignationDate, resignationData.CreatedOn.ToString(EmailPlaceholders.ShortDate))
                    .Replace(EmailPlaceholders.Department, resignationData.DepartmentName ?? "")
                    .Replace(EmailPlaceholders.RejectReason, resignationData.RejectResignationReason ?? "");


                string body = ReplacePlaceholders(fullTemplate, resignationData);

                var cc = (template.CCEmails ?? "")
                 .Split(';', StringSplitOptions.RemoveEmptyEntries)
                 .Select(e => e?.Trim())
                 .Append(resignationData.ReportingManagerEmail?.Trim())
                 .Where(e => !string.IsNullOrWhiteSpace(e))
                 .Cast<string>()
                 .Distinct(StringComparer.OrdinalIgnoreCase)
                 .ToArray();


                var emailRequest = new EmailRequest
                {
                    To = new[] { resignationData.Email },
                    CC = cc,
                    BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = template.Subject,
                    Body = body
                };

                await _emailClient.SendEmailAsync(emailRequest);
            }

        }

        public async Task EarlyReleaseRequested(long resignationId)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.EarlyReleaseRequested);

            var resignationData = await _unitOfWork.EmailNotificationRepository.GetResignationByIdAsync(resignationId);

            if (template != null && resignationData != null)
            {
                string fullTemplate = template.Content
                    .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.FirstName, resignationData.FirstName ?? "")
                    .Replace(EmailPlaceholders.LastName, resignationData.LastName ?? "")
                    .Replace(EmailPlaceholders.EarlyReleaseDate, resignationData.EarlyReleaseDate?.ToString(EmailPlaceholders.ShortDate) ?? "")
                    .Replace(EmailPlaceholders.Department, resignationData.DepartmentName ?? "");




                string body = ReplacePlaceholders(fullTemplate, resignationData);

                var cc = (template.CCEmails ?? "")
                 .Split(';', StringSplitOptions.RemoveEmptyEntries)
                 .Select(e => e?.Trim())
                 .Append(resignationData.ReportingManagerEmail?.Trim())
                 .Where(e => !string.IsNullOrWhiteSpace(e))
                 .Cast<string>()
                 .Distinct(StringComparer.OrdinalIgnoreCase)
                 .ToArray();


                var emailRequest = new EmailRequest
                {
                    To = new[] { resignationData.Email },
                    CC = cc,
                    BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = template.Subject,
                    Body = body
                };

                await _emailClient.SendEmailAsync(emailRequest);
            }

        }

        public async Task EarlyReleaseApproved(long resignationId, bool IsEarlyRequestApproved)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.EarlyReleaseRejected);
            if (IsEarlyRequestApproved)
            {
                template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.EarlyReleaseApproved);
            }

            var resignationData = await _unitOfWork.EmailNotificationRepository.GetResignationByIdAsync(resignationId);

            if (template != null && resignationData != null)
            {
                string fullTemplate = template.Content
                    .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.FirstName, resignationData.FirstName ?? "")
                    .Replace(EmailPlaceholders.LastName, resignationData.LastName ?? "")
                    .Replace(EmailPlaceholders.EarlyReleaseDate, resignationData.EarlyReleaseDate?.ToString(EmailPlaceholders.ShortDate) ?? "")
                    .Replace(EmailPlaceholders.Department, resignationData.DepartmentName ?? "");

                string body = ReplacePlaceholders(fullTemplate, resignationData);

                var cc = (template.CCEmails ?? "")
                 .Split(';', StringSplitOptions.RemoveEmptyEntries)
                 .Select(e => e?.Trim())
                 .Append(resignationData.ReportingManagerEmail?.Trim())
                 .Where(e => !string.IsNullOrWhiteSpace(e))
                 .Cast<string>()
                 .Distinct(StringComparer.OrdinalIgnoreCase)
                 .ToArray();


                var emailRequest = new EmailRequest
                {
                    To = new[] { resignationData.Email },
                    CC = cc,
                    BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = template.Subject,
                    Body = body
                };

                await _emailClient.SendEmailAsync(emailRequest);
            }
        }
        public async Task AccountClearance(int resignationId, bool IssueNoDueCertificate, bool FnFStatus)
        {
            // default if FnFStatus false and IssueNoDueCertificate is false
            string? fnfStatus;
            string noDueCertificate = "Not Granted";

            // Decide the template based on IssueNoDueCertificate

            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.AccountClearanceGranted);
            if (IssueNoDueCertificate)
            {
                noDueCertificate = "Granted";

                // If No Due Certificate is granted, check FnF status
                fnfStatus = FnFStatus ? "completed" : "incomplete";
            }
            else
            {
                // If No Due Certificate is not granted, FnFStatus is irrelevant, but we can set it to incomplete to be safe
                fnfStatus = "incomplete";
            }
            var accountClearance = await _unitOfWork.EmailNotificationRepository.GetResignationByIdAsync(resignationId);

            if (template != null && accountClearance != null)
            {
                string fullTemplate = template.Content
                   .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.FirstName, accountClearance.FirstName ?? "")
                    .Replace(EmailPlaceholders.LastName, accountClearance.LastName ?? "")
                    .Replace(EmailPlaceholders.Department, accountClearance.DepartmentName ?? "")
                    .Replace(EmailPlaceholders.NoDueCertificate, noDueCertificate ?? "")
                    .Replace(EmailPlaceholders.FnFStatus, fnfStatus ?? "");

                string body = ReplacePlaceholders(fullTemplate, accountClearance);

                var cc = (template.CCEmails ?? "")
                 .Split(';', StringSplitOptions.RemoveEmptyEntries)
                 .Select(e => e?.Trim())
                 .Append(accountClearance.ReportingManagerEmail?.Trim())
                 .Where(e => !string.IsNullOrWhiteSpace(e))
                 .Cast<string>()
                 .Distinct(StringComparer.OrdinalIgnoreCase)
                 .ToArray();


                var emailRequest = new EmailRequest
                {
                    To = !string.IsNullOrWhiteSpace(accountClearance.PersonalEmail) ? new[] { accountClearance.PersonalEmail } : new[] { accountClearance.Email },
                    CC = cc,
                    BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = template.Subject,
                    Body = body
                };


                await _emailClient.SendEmailAsync(emailRequest);
            }
        }

        public async Task ITClearance(ITClearanceRequestDTO iTClearanceRequestDTO)
        {

            string assetCondition = Enum.GetName(typeof(AssetCondition), iTClearanceRequestDTO.AssetCondition) ?? "Unknown";
            string assetReturned = iTClearanceRequestDTO.AssetReturned ? "Returned" : "Not Returned";
            string accessRevoked = iTClearanceRequestDTO.AccessRevoked ? "Revoked" : "Not Revoked";
            string noDueCertificate = iTClearanceRequestDTO.ITClearanceCertification ? "Granted" : "Not Granted";




            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.ITClearanceGranted);

            var iTClearance = await _unitOfWork.EmailNotificationRepository.GetResignationByIdAsync(iTClearanceRequestDTO.ResignationId);

            if (template != null && iTClearance != null)
            {
                string fullTemplate = template.Content
                    .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.FirstName, iTClearance.FirstName ?? "")
                    .Replace(EmailPlaceholders.LastName, iTClearance.LastName ?? "")
                    .Replace(EmailPlaceholders.Department, iTClearance.DepartmentName ?? "")
                    .Replace(EmailPlaceholders.AssetCondition, assetCondition ?? "")
                    .Replace(EmailPlaceholders.AssetReturned, assetReturned ?? "")
                    .Replace(EmailPlaceholders.AccessRevoked, accessRevoked ?? "")
                    .Replace(EmailPlaceholders.NoDueCertificate, noDueCertificate ?? "");




                string body = ReplacePlaceholders(fullTemplate, iTClearance);

                var cc = (template.CCEmails ?? "")
                 .Split(';', StringSplitOptions.RemoveEmptyEntries)
                 .Select(e => e?.Trim())
                 .Append(iTClearance.ReportingManagerEmail?.Trim())
                 .Where(e => !string.IsNullOrWhiteSpace(e))
                 .Cast<string>()
                 .Distinct(StringComparer.OrdinalIgnoreCase)
                 .ToArray();


                var emailRequest = new EmailRequest
                {
                    To = !string.IsNullOrWhiteSpace(iTClearance.PersonalEmail) ? new[] { iTClearance.PersonalEmail } : new[] { iTClearance.Email },
                    CC = cc,
                    BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = template.Subject,
                    Body = body
                };


                await _emailClient.SendEmailAsync(emailRequest);
            }
        }

        public async Task GrievanceSubmittedEmailAsync(string TicketNo)
        {
            var grievanceTemplate = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.GrievanceSubmitted);



            var grievanceData = await _unitOfWork.EmailNotificationRepository.GetGrievanceData(TicketNo);


            // 1. Get grievance owner emails (for CC)
            var grievanceOwnerEmails = await _unitOfWork.EmailNotificationRepository.GetGrievanceOwner(TicketNo);
            var ownerEmailList = grievanceOwnerEmails
                                    .Where(e => !string.IsNullOrWhiteSpace(e.OwnerEmail))
                                    .Select(e => e.OwnerEmail)
                                    .Distinct(StringComparer.OrdinalIgnoreCase)
                                    .ToList();

            // 2. Parse template CC emails
            var templateCcEmails = grievanceTemplate?.CCEmails?
                                        .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                                        .Distinct(StringComparer.OrdinalIgnoreCase)
                                        .ToList() ?? new List<string>();

            // 3. Merge both, avoiding duplicates
            var ccRecipients = templateCcEmails
                                .Union(ownerEmailList, StringComparer.OrdinalIgnoreCase)
                                .ToArray();

            foreach (var item in grievanceData)
            {
                string fullTemplate = grievanceTemplate.Content
                    .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.TicketNo, TicketNo);

                string body = ReplacePlaceholders(fullTemplate, item);

                var emailRequest = new EmailRequest
                {
                    To = new[] { item.Email },
                    CC = ccRecipients,
                    BCC = grievanceTemplate?.BCCEmails?
                            .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                            .ToArray() ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = grievanceTemplate.Subject?.Replace("{TicketNo}", TicketNo) ?? "",
                    Body = body
                };

                await _emailClient.SendEmailAsync(emailRequest);

            }
        }

        public async Task NewRoleAddedAsync(string RoleName, DateTime CreatedOn)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.NewRoleAdded);

            var ccHREmails = await _unitOfWork.EmailNotificationRepository.GetAllEmailByRole(Roles.HR);

            if (template != null)
            {
                string fullTemplate = template.Content
                    .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.RoleName, RoleName ?? "")
                    .Replace(EmailPlaceholders.CreatedOn, CreatedOn.ToString(EmailPlaceholders.ShortDate) ?? "");

                var hrEmails = ccHREmails?.Select(e => e.Email) ?? Enumerable.Empty<string>();

                var templateCC = template.CCEmails?
                   .Split(';', StringSplitOptions.RemoveEmptyEntries)
                   ?? Array.Empty<string>();

                var combinedCC = templateCC
                       .Concat(hrEmails)
                       .Distinct()
                       .ToArray();


                var emailRequest = new EmailRequest
                {
                    To = template.ToEmail?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    CC = combinedCC,
                    BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = template.Subject?.Replace("{RoleName}", RoleName) ?? "",
                    Body = fullTemplate
                };

                await _emailClient.SendEmailAsync(emailRequest);
            }


        }
        public async Task UpdatedPolicy(string PolicyName, bool IsEdit)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.NewPolicyAdded);

            if (IsEdit)
            {
                template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.UpdatedPolicy);
            }



            if (template != null)
            {
                string fullTemplate = template.Content
                    .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.DocumentName, PolicyName ?? "");


                var emailRequest = new EmailRequest
                {
                    To = template.ToEmail?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    CC = template.CCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = template.Subject?.Replace("{DocumentName}", PolicyName) ?? "",
                    Body = fullTemplate
                };

                await _emailClient.SendEmailAsync(emailRequest);
            }
        }

        public async Task KPIComplete(long planId)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.KPIComplete);

            var kpiData = await _unitOfWork.EmailNotificationRepository.KPICompleteData(planId);

            if (template != null && kpiData != null)
            {
                string fullTemplate = template.Content
                    .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? string.Empty)
                    .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? string.Empty)
                    .Replace(EmailPlaceholders.FirstName, kpiData.FirstName ?? "")
                    .Replace(EmailPlaceholders.LastName, kpiData.LastName ?? "")
                    .Replace(EmailPlaceholders.ReportingManagerName, kpiData.ReportingManagerName ?? "")
                    .Replace(EmailPlaceholders.ReviewDate, kpiData.ReviewDate.ToString("yyyy-MM-dd"));


                string body = ReplacePlaceholders(fullTemplate, kpiData);




                var emailRequest = new EmailRequest
                {
                    To = template.ToEmail?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    CC = template.CCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                    FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                    FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                    Subject = template.Subject,
                    Body = body
                };

                await _emailClient.SendEmailAsync(emailRequest);
            }


        }
        //Email Send Service
        public async Task SendNotificationAsync()
        {
            var notifications = await _unitOfWork.EmailNotificationRepository.GetNotificationAsync();
            foreach (var notification in notifications)
            {
                var emailRequest = new EmailRequest
                {
                    To = [notification.ToEmail],
                    CC = String.IsNullOrEmpty(notification.CC) ? Array.Empty<string>() :
                         notification.CC.Split(',')
                                        .Select(email => email.Trim())
                                        .Where(email => !string.IsNullOrWhiteSpace(email))
                                        .ToArray(),
                    Subject = notification.Subject,
                    Body = notification.Body
                };
                var result = await _emailClient.SendEmailAsync(emailRequest);
                if (result.Status)
                {
                    await _unitOfWork.EmailNotificationRepository.MarkAsSentAsync(notification.Id);
                }
            }

        }

        private static string ReplacePlaceholders(string template, object dto)
        {
            if (string.IsNullOrWhiteSpace(template) || dto == null)
                return template;

            var properties = dto.GetType().GetProperties();

            foreach (var property in properties)
            {
                var value = property.GetValue(dto) switch
                {
                    DateTime dt => dt.ToString(EmailPlaceholders.ShortDate),
                    null => string.Empty,
                    var v => v.ToString()
                };


                template = System.Text.RegularExpressions.Regex.Replace(
                    template,
                    $"\\{{{property.Name}\\}}",
                    value,
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            }

            return template;
        }

        public async Task FeedbackSubmittedEmailAsync(long feedbackId)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.FeedbackSubmitted);
            var feedbackData = await _unitOfWork.FeedbackRepository.GetFeedbackByIdAsync(feedbackId);

            FeedbackType feedbackType = (FeedbackType)feedbackData.FeedbackType;
            string feedbackTypeDescription = feedbackType.ToString();

            TicketStatus ticketStatus = (TicketStatus)feedbackData.TicketStatus;
            string ticketStatusDescription = ticketStatus.ToString(); 

            var cc = (template.CCEmails ?? "")
                .Split(';', StringSplitOptions.RemoveEmptyEntries)
                .Select(e => e.Trim())
                .Where(e => !string.IsNullOrWhiteSpace(e))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            var nameParts = feedbackData.EmployeeName?.Split(' ', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
            string firstName = nameParts.Length > 0 ? nameParts[0] : "";
            string lastName = nameParts.Length > 1 ? nameParts[1] : "";

            string body = template.Content
                .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? "")
                .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? "")
                .Replace(EmailPlaceholders.EmployeeName, feedbackData.EmployeeName ?? "")
                .Replace(EmailPlaceholders.FirstName, firstName)
                .Replace(EmailPlaceholders.LastName, lastName)
                .Replace(EmailPlaceholders.TicketId, feedbackData.Id.ToString())
                .Replace(EmailPlaceholders.FeedbackType, feedbackTypeDescription)
                .Replace(EmailPlaceholders.Subject, feedbackData.Subject ?? "")
                .Replace(EmailPlaceholders.Description, feedbackData.Description ?? "")
                .Replace(EmailPlaceholders.TicketStatus, ticketStatusDescription)
                .Replace(EmailPlaceholders.CreatedOn, feedbackData.CreatedOn.ToString(EmailPlaceholders.ShortDate));

            body = ReplacePlaceholders(body, feedbackData);

            var emailRequest = new EmailRequest
            {
                To = new[] { feedbackData.EmployeeEmail ?? "" },
                CC = cc,
                BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                Subject = template.Subject,
                Body = body
            };

            await _emailClient.SendEmailAsync(emailRequest);
            
            
        }

        public async Task FeedbackStatusChangedEmailAsync(long feedbackId)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetNotificationTemplateByType(EmailTemplateTypes.FeedbackStatusChanged);
            var feedbackData = await _unitOfWork.FeedbackRepository.GetFeedbackByIdAsync(feedbackId);

            FeedbackType feedbackType = (FeedbackType)feedbackData.FeedbackType;
            string feedbackTypeDescription = feedbackType.ToString();

            TicketStatus ticketStatus = (TicketStatus)feedbackData.TicketStatus;
            string ticketStatusDescription = ((DescriptionAttribute)Attribute.GetCustomAttribute(typeof(TicketStatus).GetField(ticketStatus.ToString()), typeof(DescriptionAttribute)))?.Description ?? ticketStatus.ToString();

            var cc = (template.CCEmails ?? "")
                .Split(';', StringSplitOptions.RemoveEmptyEntries)
                .Select(e => e.Trim())
                .Where(e => !string.IsNullOrWhiteSpace(e))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToArray();

            var nameParts = feedbackData.EmployeeName?.Split(' ', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
            string firstName = nameParts.Length > 0 ? nameParts[0] : "";
            string lastName = nameParts.Length > 1 ? nameParts[1] : "";

            string body = template.Content
                .Replace(EmailPlaceholders.SenderName, _configuration["EmailSMTPSettings:SenderName"] ?? "")
                .Replace(EmailPlaceholders.SenderEmail, _configuration["EmailSMTPSettings:SenderEmail"] ?? "")
                .Replace(EmailPlaceholders.EmployeeName, feedbackData.EmployeeName ?? "")
                .Replace(EmailPlaceholders.FirstName, firstName)
                .Replace(EmailPlaceholders.LastName, lastName)
                .Replace(EmailPlaceholders.TicketId, feedbackData.Id.ToString())
                .Replace(EmailPlaceholders.FeedbackType, feedbackTypeDescription)
                .Replace(EmailPlaceholders.Subject, feedbackData.Subject ?? "")
                .Replace(EmailPlaceholders.Description, feedbackData.Description ?? "")
                .Replace(EmailPlaceholders.TicketStatus, ticketStatusDescription)
                .Replace(EmailPlaceholders.CreatedOn, feedbackData.CreatedOn.ToString(EmailPlaceholders.ShortDate))
                .Replace(EmailPlaceholders.AdminComment, feedbackData.AdminComment ?? "No comments provided")
                .Replace(EmailPlaceholders.ModifiedOn, feedbackData.ModifiedOn.HasValue ? feedbackData.ModifiedOn.Value.ToString(EmailPlaceholders.ShortDate) : "N/A");

            body = ReplacePlaceholders(body, feedbackData);

            var emailRequest = new EmailRequest
            {
                To = new[] { feedbackData.EmployeeEmail ?? "" },
                CC = cc,
                BCC = template.BCCEmails?.Split(';', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>(),
                FromEmail = _configuration["EmailSMTPSettings:SenderEmail"]!,
                FromName = _configuration["EmailSMTPSettings:SenderName"]!,
                Subject = template.Subject,
                Body = body
            };

            await _emailClient.SendEmailAsync(emailRequest);
        }
    }
}
