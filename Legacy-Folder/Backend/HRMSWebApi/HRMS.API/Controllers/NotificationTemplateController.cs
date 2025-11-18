using HRMS.API.Validations;
using HRMS.Application.Services;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Models.Models.UserProfile;
using HRMS.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using HRMS.Models.Models.NotificationTemplate;
using HRMS.API.Athorization;
using HRMS.Domain;
using Microsoft.Extensions.Options;
using HRMS.Domain.Enums;
using Quartz;

namespace HRMS.API.Controllers
{
    [ApiController]
    [Route("api/NotificationTemplate")]
    [HasPermission(Permissions.ReadEmailNotification)]
    public class NotificationTemplateController : ControllerBase
    {
        private readonly INotificationTemplateService _notificationService;
        private readonly NotificationTemplateRequestValidation _validations;
        private readonly IEmailNotificationService _email;
        private readonly ISchedulerFactory _schedulerFactory;


        public NotificationTemplateController(INotificationTemplateService notificationService, NotificationTemplateRequestValidation validations, IEmailNotificationService email, ISchedulerFactory schedulerFactory)
        {
            _email = email;
            _notificationService = notificationService;
            _validations = validations;
            _schedulerFactory = schedulerFactory;
        }

        /// <summary>
        /// Save email template
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Email template is saved successfully</response>
        /// <response code="400">Error in saving email template</response>
        [HttpPost]
        [Route("AddEmailTemplate")]
        [HasPermission(Permissions.CreateEmailNotification)]
        public async Task<IActionResult> AddEmailTemplate(EmailTemplateUpdateRequestDto request)
        {
            var validationResult = await _validations.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _notificationService.AddEmailTemplate(request);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get filtered list of email templates 
        /// </summary>
        /// <param name="requestDto">**Request parameter**</param>
        /// <response code="200">Return list of email templates</response>       
        [HttpPost]
        [Route("GetEmailTemplates")]
        [HasPermission(Permissions.ReadEmailNotification)]
        public async Task<IActionResult> GetEmailTemplates(SearchRequestDto<EmailTemplateSearchRequestDto> requestDto)
        {
            var response = await _notificationService.FilterEmailTemplates(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get email template by Id
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Returns email template</response>
        /// <response code="404">Email template not found</response>        
        [HttpGet]
        [Route("{id:long}")]
        [HasPermission(Permissions.ViewEmailNotification)]
        public async Task<IActionResult> GetEmailTemplateById(long id)
        {
            var response = await _notificationService.GetEmailTemplateById(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get list of email template names
        /// </summary>
        /// <response code="200">Return list of email template names</response>
        /// <response code="404">Email templates not found</response>     
        [HttpGet]
        [Route("GetEmailTemplateNameList")]
        [HasPermission(Permissions.ReadEmailNotification)]
        public async Task<IActionResult> GetEmailTemplateNameList()
        {
            var response = await _notificationService.GetEmailTemplateNameList();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update email template
        /// </summary>
        /// <param name="request">**Request Parameters**</param>
        /// <response code="200">Return 200 status for successfully update</response>
        /// <response code="404">Email template not found</response>
        [HttpPost]
        [Route("UpdateEmailTemplate")]
        [HasPermission(Permissions.EditEmailNotification)]
        public async Task<IActionResult> UpdateEmailTemplate(EmailTemplateUpdateRequestDto request)
        {
            var validationResult = await _validations.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _notificationService.UpdateEmailTemplate(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Set status of email template as active / inactive
        /// </summary>
        /// <param name="id"></param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Email template not found</response>    
        [HttpPost]
        [Route("ToggleEmailTemplateStatus")]
        [HasPermission(Permissions.DeleteEmailNotification)]
        public async Task<IActionResult> ToggleEmailTemplateStatus(long id)
        {
            var response = await _notificationService.ToggleEmailTemplateStatus(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Return default Template according to EmailTemplateType
        /// </summary>
        /// <param name="type"></param>
        /// <response code="200">Return 200 status code for successfully return</response>
        /// <response code="404">Email template not found</response>    
        [HttpGet]
        [Route("GetDefaultTemplate")]
        [HasPermission(Permissions.ReadEmailNotification)]
        public async Task<IActionResult> GetDefaultTemplate(EmailTemplateTypes type)
        {
            var response = await _notificationService.GetDefaultEmailTemplate(type);
            return StatusCode(response.StatusCode, response);
        }

        //  Testing API For SMTP Email Services

        [HttpGet]
        [Route("Birthday")]
        public async Task Birthday()
        {
            await _email.AddBirthdayEmailAsync();
        }
        [HttpGet]
        [Route("Anniversary")]
        public async Task Anniversary()
        {
            await _email.AddWorkAnniversaryEmailAsync();
        }
        [HttpGet]
        [Route("WelcomeEmail")]
        public async Task WelcomeEmail(string email)
        {

            await _email.AddWelcomeEmailAsync(email);
        }
        [HttpGet]
        [Route("ResignationAcceptEmail")]
        public async Task ResignationAcceptEmail()
        {
            await _email.AddResignationApprovedEmailAsync(15);
        }

        // /// <summary>
        // /// Trigger Cron Job for Email
        // /// </summary>
        [HttpPost]
        [Route("TriggerCronForEmail")]
        public async Task<IActionResult> TriggerCronForEmail()
        {
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobKey = new JobKey(QuartzConstants.SendEmailNotificationJobKey);

            if (await scheduler.CheckExists(jobKey))
            {
                await scheduler.TriggerJob(jobKey);
                return Ok(SuccessMessage.JobTriggered);
            }

            return NotFound(ErrorMessage.JobNotFound);
        }

        /// <summary>
        /// Set isDeleted of email template as 1 / inactive
        /// </summary>
        /// <param name="id"></param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Email template not found</response>    
        [HttpPost]
        [Route("DeleteTemplate/{id:long}")]
        // [HasPermission(Permissions.DeleteEmailNotification)]
        public async Task<IActionResult> DeleteTemplate(long id)
        {
            var response = await _notificationService.DeleteTemplateAsync(id);
            return StatusCode(response.StatusCode, response);
        }


    }
}
