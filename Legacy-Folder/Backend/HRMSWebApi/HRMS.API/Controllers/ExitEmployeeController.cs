using HRMS.API.Athorization;
using HRMS.Domain.Contants;
using HRMS.Models.Models.UserProfile;
using HRMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.Application.Services;
using System.Net;
using HRMS.Models.Models.Employees;

namespace HRMS.API.Controllers
{
    [Route("api/ExitEmployee")]
    [ApiController]
    public class ExitEmployeeController(IExitEmployeeService exitEmployeeService, AddResignationRequestValidation resignationRequestValidation) : ControllerBase
    {
         
        private readonly IExitEmployeeService _exitEmployeeService = exitEmployeeService;

        /// <summary>
        /// Resignation
        /// </summary>
        /// <param name="resignationRequestDto"></param>
        /// <response code="200">Return 200 status for successfully save</response> 
        /// <response code="400">Error in saving resignation </response>   
        [HttpPost]
        [Route("AddResignation")]
        [HasPermission(Permissions.CreatePersonalDetails)]
        public async Task<IActionResult> AddResignation(ResignationRequestDto resignationRequestDto)
        {

            var validationResult = await resignationRequestValidation.ValidateAsync(resignationRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _exitEmployeeService.AddResignation(resignationRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get resignation Form 
        /// </summary>
        /// <param name="id"></param>
        /// <response code="200">Returns resignation detail</response>
        /// <response code="404">user not found</response>
        [HttpGet]
        [Route("GetResignationForm/{id:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<ResignationResponseDto>), 200)]
        [HasPermission(Permissions.ViewPersonalDetails)]
        public async Task<IActionResult> GetResignationForm(int id)
        {
            var response = await _exitEmployeeService.GetResignationById(id);
            return StatusCode(response.StatusCode, response);
        }
        [HttpGet]
        [Route("GetResignationDetails/{id:long}")]
        [HasPermission(Permissions.ViewPersonalDetails)]
        public async Task<IActionResult> GetResignationExitDetails(int id)
        {
            var response = await _exitEmployeeService.GetResignationExitData(id);
            return StatusCode(response.StatusCode, response);
        }
         
        /// <summary>
        /// Revoke Resignation
        /// </summary>
        /// <param name="resignationId"></param>
        /// <response code="200">Returns 200 status for successful revoke</response> 
        /// <response code="400">Invalid request or unable to revoke resignation</response>  
        [HttpPost]
        [Route("RevokeResignation/{resignationId:int}")]
        // [HasPermission(Permissions.EditPersonalDetails)]
        public async Task<IActionResult> RevokeResignation(int resignationId)
        {
            var response = await _exitEmployeeService.RevokeResignation(resignationId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Requests an early release for an employee resignation.
        /// </summary>
        /// <param name="request">DTO containing resignation ID, early release date, and resignation status.</param>
        /// <returns>API response with success or failure message.</returns>
        [HttpPost]
        [Route("RequestEarlyRelease")]
        public async Task<IActionResult> RequestEarlyRelease([FromBody] EarlyReleaseRequestDto request)
        {
            var response = await _exitEmployeeService.RequestEarlyReleaseAsync(request);
            return StatusCode(response.StatusCode, response);
        }


        /// <summary>
        /// Is resignation already exist
        /// </summary>
        /// <param name="EmployeeId">Employee Id</param>
        /// <response code="200">Returns boolean </response>
        /// <response code="404">user not found</response>
        [HttpGet]
        [Route("IsResignationExist/{EmployeeId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<IsResignationExistResponseDTO>), 200)]
        [HasPermission(Permissions.ViewPersonalDetails)]
        public async Task<IActionResult> IsResignationExist(int EmployeeId)
        {
            var response = await _exitEmployeeService.IsResignationExist(EmployeeId);
             
            return StatusCode(response.StatusCode, response);
        }

    }
}
