using HRMS.API.Athorization;
using HRMS.API.Validations;
using HRMS.Application.Services;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Models;
using HRMS.Models.Models.CompanyPolicy;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace HRMS.API.Controllers
{
    [Route("api/UserProfile")]
    [HasPermission(Permissions.ReadEducationalDetails)]
    [ApiController]
    public class EducationalDetailController : ControllerBase
    {
        private readonly UserQualificationRequestValidation _UserQualificationRequestValidation;
        private readonly IEducationalDetailService _educationalDetailService;
        private readonly IUserProfileService _userProfileService;


        public EducationalDetailController(UserQualificationRequestValidation userQualificationRequestValidation,IEducationalDetailService educationalDetailService, IUserProfileService userProfileService)
        {
            this._UserQualificationRequestValidation = userQualificationRequestValidation;
            this._educationalDetailService = educationalDetailService;
            this._userProfileService = userProfileService;
        }

        /// <summary>
        /// Add educational detail
        /// </summary>
        /// <param name="userQualificationInfoRequest"></param>
        /// <response code="200">educational details is saved successfully</response>
        /// <response code="400">Error in saving educational details</response>
        /// <returns></returns>
        [HttpPost]
        [Route("AddEducationalDetails")]
        [HasPermission(Permissions.CreateEducationalDetails)]
        public async Task<IActionResult> AddEducationalDetails([FromForm] UserQualificationInfoRequestDto userQualificationInfoRequest)
        {
            var validationResult = await _UserQualificationRequestValidation.ValidateAsync(userQualificationInfoRequest);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _educationalDetailService.AddEducationalDetails(userQualificationInfoRequest);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update educational detail
        /// </summary>
        /// <param name="userQualificationInfoRequest"></param>
        /// <response code="200">Return 200 status for successfully update</response>
        /// <response code="400">Error in updating educational detail</response> 
        /// <returns></returns>
        [HttpPut]
        [Route("EditEducationalDetails")]
        [HasPermission(Permissions.EditEducationalDetails)]
        public async Task<IActionResult> EditEducationalDetails([FromForm] UserQualificationInfoRequestDto userQualificationInfoRequest)
        {
            var validationResult = await _UserQualificationRequestValidation.ValidateAsync(userQualificationInfoRequest);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _educationalDetailService.EditEducationalDetails(userQualificationInfoRequest);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get educational detail by id
        /// </summary>
        /// <param name="id"></param>
        ///  <response code="200">Returns  educational detail by id</response>
        /// <response code="404"> Educational details not found</response>
        /// <returns></returns>
        [HttpGet]
        [Route("GetEducationalDetailsById/{id:long}")]
        [HasPermission(Permissions.ViewEducationalDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<EduDocResponseDto>), 200)]
        public async Task<IActionResult> GetEducationalDetailsById(long id)
        {
            var response = await _educationalDetailService.GetEducationalDetailsById(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Delete educational detail by id
        /// </summary>
        /// <param name="id"></param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Educational detail not found</response>  
        /// <returns></returns>
        [HttpDelete]
        [Route("DeleteEducationalDetails/{id:long}")]
        [HasPermission(Permissions.DeleteEducationalDetails)]
        public async Task<IActionResult> DeleteEducationalDetails(long id)
        {
            var response = await _educationalDetailService.DeleteEducationalDetails(id);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get list of education documents of user
        /// </summary>
        /// <param name="requestDto"></param>
        /// <response code="200">Return the educationalDocuments </response>
        /// <returns></returns>
        [HttpPost]
        [Route("GetEducationalDocuments")]
        [HasPermission(Permissions.ReadEducationalDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<EduDocSearchResponseDto>), 200)]
        public async Task<IActionResult> GetEducationalDocuments(SearchRequestDto<EduDocSearchRequestDto> requestDto)
        {

            var response = await _educationalDetailService.GetEducationalDocuments(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get Qualification list
        /// </summary>
        /// <response code="200">Returns Qualification list</response>
        [HttpGet]
        [Route("GetQualificationList")]
        [HasPermission(Permissions.ReadEducationalDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<QualificationResponseDto>>), 200)]
        public async Task<IActionResult> GetQualificationList()
        {
            var response = await _userProfileService.GetQualificationList();
            return StatusCode(response.StatusCode, response);
        }
    }
}