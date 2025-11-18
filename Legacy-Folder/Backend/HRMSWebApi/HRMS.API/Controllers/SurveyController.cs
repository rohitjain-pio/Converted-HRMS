using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Models.Models.NotificationTemplate;
using HRMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using HRMS.Models.Models.Survey;
using Microsoft.IdentityModel.Tokens;
using HRMS.Application.Services;
using HRMS.Models.Models.Employees;
using HRMS.API.Athorization;

namespace HRMS.API.Controllers
{
    [Route("api/Survey")]
    [ApiController]
    [HasPermission(Permissions.ReadSurvey)]
    public class SurveyController : ControllerBase
    {
        private readonly ISurveyService _surveyService;
        private readonly SurveyRequestValidation _validations;
        private readonly SurveyAnswerRequestValidation _surveyAnswerValidations;
        public SurveyController(ISurveyService surveyService, SurveyRequestValidation validations, SurveyAnswerRequestValidation surveyAnswerValidations)
        {
            _surveyService = surveyService;
            _validations = validations;
            _surveyAnswerValidations = surveyAnswerValidations;
        }

        /// <summary>
        /// Save survey
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Survey is saved successfully</response>
        /// <response code="400">Error in saving survey</response>
        [HttpPost]
        [Route("AddSurvey")]
        [HasPermission(Permissions.CreateSurvey)]

        public async Task<IActionResult> AddSurvey(SurveyRequestDto request)
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
            var response = await _surveyService.AddSurvey(request);
            return StatusCode(response.StatusCode, response);
        }


        /// <summary>
        /// Delete survey
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Survey not found</response>  
        [HttpDelete]
        [Route("DeleteSurvey/{id:long}")]
        [HasPermission(Permissions.DeleteSurvey)]

        public async Task<IActionResult> DeleteSurvey(long id)
        {
            var response = await _surveyService.DeleteSurvey(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get survey by Id
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Return survey details</response>
        /// <response code="404">Survey details not found</response>        
        [HttpGet]
        [Route("{id:long}")]
        [HasPermission(Permissions.ViewSurvey)]

        [ProducesResponseType(typeof(ApiResponseModel<SurveyResponseDto>), 200)]
        public async Task<IActionResult> GetSurveyById(long id)
        {
            var response = await _surveyService.GetSurveyDetailsById(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update survey
        /// </summary>
        /// <param name="request">**Request Parameters**</param>
        /// <response code="200">Return 200 status for successfully update</response>
        /// <response code="400">Error in updating survey</response> 
        [HttpPost]
        [Route("UpdateSurvey")]
        [HasPermission(Permissions.EditSurvey)]

        public async Task<IActionResult> UpdateSurvey(SurveyRequestDto request)
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
            var response = await _surveyService.UpdateSurvey(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get list of survey status
        /// </summary>
        /// <response code="200">Return list of survey status</response>       
        [HttpGet]
        [Route("GetSurveyStatusList")]
        [HasPermission(Permissions.ReadSurvey)]

        public async Task<IActionResult> GetSurveyStatusList()
        {
            var response = await _surveyService.GetSurveyStatusList();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Publish survey
        /// </summary>
        /// <param name="publishSurveyRequestDto">**Request Parameters**</param>
        /// <response code="200">Return 200 status for successfully publish</response>
        /// <response code="404">Survey not found</response>
        /// <response code="400">Error in publish survey</response>
        [HttpPut]
        [Route("PublishSurvey")]
        [HasPermission(Permissions.PublishSurvey)]

        public async Task<IActionResult> PublishSurvey(PublishSurveyRequestDto publishSurveyRequestDto)
        {
            var response = await _surveyService.PublishSurvey(publishSurveyRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Save survey
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Survey is saved successfully</response>
        /// <response code="400">Error in saving survey</response>
        [HttpPost]
        [Route("AddSurveyResponse")]
        [HasPermission(Permissions.CreateSurveyReport)]

        public async Task<IActionResult> AddSurveyAnswer(SurveyAnswerRequestDto request)
        {
            var validationResult = await _surveyAnswerValidations.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _surveyService.AddSurveyAnswer(request);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get list of surveys
        /// </summary>
        /// <param name="request">**Request parameter**</param>
        /// <response code="200">Return list of surveys</response>
        [HttpPost]
        [Route("GetSurveyList")]
        [HasPermission(Permissions.ReadSurvey)]

        [ProducesResponseType(typeof(ApiResponseModel<SurveySearchResponseDto>), 200)]
        public async Task<IActionResult> GetSurveyList(SearchRequestDto<SurveySearchRequestDto> request)
        {
            var response = await _surveyService.GetSurveyList(request);
            return StatusCode(response.StatusCode, response);
        }

    }
}
