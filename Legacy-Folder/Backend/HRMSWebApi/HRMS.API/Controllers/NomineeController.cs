using HRMS.API.Athorization;
using HRMS.API.Validations;
using HRMS.Application.Services;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Dashboard;
using HRMS.Models.Models.Event;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace HRMS.API.Controllers
{
    [Route("api/UserProfile")]
    [ApiController]
    [HasPermission(Permissions.ReadNomineeDetails)]

    public class NomineeController(NomineeRequestValidation NomineeRequestValidation, INomineeService nomineeService, IUserProfileService userProfileService) : ControllerBase
    {
        private readonly NomineeRequestValidation _NomineeRequestValidation = NomineeRequestValidation;
        private readonly INomineeService _nomineeService = nomineeService;
        private readonly IUserProfileService _userProfileService = userProfileService;

        /// <summary>
        /// Add Nominee
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Nominee is added successfully</response>
        /// <response code="400">Error in adding Nominee</response>
        /// <response code="404">invalid doc max size,no file was provided</response>
        [HttpPost]
        [Route("AddNominee")]
        [HasPermission(Permissions.CreateNomineeDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        public async Task<IActionResult> AddNominee([FromForm] NomineeRequestDto request)
        {
            var validationResult = await _NomineeRequestValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _nomineeService.AddNominee(request);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Update Nominee
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Nominee is updated successfully</response>
        /// <response code="400">Error in updating Nominee</response>
        [HttpPut]
        [Route("UpdateNominee")]
        [HasPermission(Permissions.EditNomineeDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        public async Task<IActionResult> UpdateNominee([FromForm] NomineeRequestDto request)
        {
            var validationResult = await _NomineeRequestValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _nomineeService.UpdateNominee(request);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Delete Nominee
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Nominee is deleted successfully</response>
        /// <response code="400">Error in deleting Nominee</response>
        [HttpDelete]
        [Route("DeleteNominee/{id:long}")]
        [HasPermission(Permissions.DeleteNomineeDetails)]
        public async Task<IActionResult> DeleteNominee(long id)
        {
            var response = await _nomineeService.DeleteNominee(id);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get Nominee List
        /// </summary>
        /// <param name="requestDto"></param>
        /// <response code="200">Return list of Nominee</response>
        /// <response code="400">Nominee not found</response>
        [HttpPost]
        [Route("GetNomineeList")]
        [HasPermission(Permissions.ReadNomineeDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<NomineeSearchResponseDto>), 200)]
        public async Task<IActionResult> GetNomineeList(SearchRequestDto<NomineeSearchRequestDto> requestDto)
        {
            var response = await _nomineeService.GetNomineeList(requestDto);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get Nominee By Id
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Return Nominee detail</response>
        /// <response code="400">Nominee not found</response>
        [HttpGet]
        [Route("GetNomineeById/{id:long}")]
        [HasPermission(Permissions.ViewNomineeDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<NomineeResponseDto>), 200)]
        public async Task<IActionResult> GetNomineeById(long id)
        {
            var response = await _nomineeService.GetNomineeById(id);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Download nominee document
        /// </summary>
        /// <param name="fileName">**Request model**</param>
        /// <response code="200">Returns the nominee document in byte array</response>
        /// <response code="400">nominee document name not found</response>    
        /// <response code="400">nominee document file name required</response>    
        [HttpGet]
        [Route("DownloadNomineeDocument")]
        [HasPermission(Permissions.ViewNomineeDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<byte[]>), 200)]
        public async Task<IActionResult> DownloadNomineeDocument(string fileName)
        {
            var response = await _nomineeService.DownloadNomineeDocument(BlobContainerConstants.UserDocumentContainer, fileName);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get relationship list
        /// </summary>
        /// <response code="200">Returns relationship list</response>
        [HttpGet]
        [Route("GetRelationshipList")]
        [HasPermission(Permissions.ReadNomineeDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<RelationshipResponseDto>>), 200)]
        public async Task<IActionResult> GetRelationshipList()
        {
            var response = await _userProfileService.GetRelationshipList();
            return StatusCode(response.StatusCode, response);
        }

    }
}
