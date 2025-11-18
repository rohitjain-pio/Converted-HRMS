using HRMS.API.Athorization;
using HRMS.API.Validations;
using HRMS.Application.Services;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Models;
using HRMS.Models.Models.EmployeeGroup;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace HRMS.API.Controllers
{
    [Route("api/EmployeeGroup")]
    [HasPermission(Permissions.ReadEmployeeGroup)]
    [ApiController]
    public class EmployeeGroupController(IEmployeeGroupService employeeGroupService, EmployeeGroupRequestValidation validations) : ControllerBase
    {
        private readonly IEmployeeGroupService _employeeGroupService = employeeGroupService;
        private readonly EmployeeGroupRequestValidation _validations = validations;

        /// <summary>
        /// Get list of employee group for dropdown
        /// </summary>      
        /// <response code="200">Return list of employee group</response>
        [HttpGet]
        [HasPermission(Permissions.ReadEmployeeGroup)]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<GroupResponseDto>>), 200)]
        public async Task<IActionResult> Get()
        {
            var response = await _employeeGroupService.GetEmployeeGroups();
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Save Employee Group
        /// </summary>
        /// <param name="employeeGroupRequestDto"></param>
        /// <response code="200">Employee group is saved successfully</response>
        /// <response code="400">Error is saving employee group</response>
        [HttpPost]
        [HasPermission(Permissions.CreateEmployeeGroup)]       
        public async Task<IActionResult> PostEmployeeGroup(EmployeeGroupRequestDto employeeGroupRequestDto)
        {
            var validationResult = await _validations.ValidateAsync(employeeGroupRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _employeeGroupService.CreateGroup(employeeGroupRequestDto);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Delete Employee Group
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Employee group not found</response>    
        [HttpDelete]
        [Route("{id:long}")]
        [HasPermission(Permissions.DeleteEmployeeGroup)]
        public async Task<IActionResult> Delete(long id)
        {
            var response = await _employeeGroupService.Delete(id);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Update employee group
        /// </summary>
        /// <param name="employeeGroupRequestDto">**Request Parameters**</param>
        /// <response code="200">Return 200 status for successfully update</response>
        /// <response code="404">Employee group not found</response>
        /// <response code="400">Error in updating employee group</response> 
        [HttpPut]
        [HasPermission(Permissions.EditEmployeeGroup)]       
        public async Task<IActionResult> PutEmployeeGroup(EmployeeGroupRequestDto employeeGroupRequestDto)
        {
            var validationResult = await _validations.ValidateAsync(employeeGroupRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _employeeGroupService.UpdateGroup(employeeGroupRequestDto);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get all employees list for dropdown to show in Employee Group
        /// </summary>
        /// <response code="200">Returns all employees </response>
        /// <returns></returns>
        [HttpGet]
        [Route("GetAllEmployees")]
        [HasPermission(Permissions.ReadEmployeeGroup)]
        [ProducesResponseType(typeof(ApiResponseModel<EmployeeDto>), 200)]
        public async Task<IActionResult> GetAllEmployees()
        {
            var response = await _employeeGroupService.GetAllEmployees();
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get Employee group details by id
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Return Employee group </response>
        /// <response code="404">Employee group not found</response>
        [HttpGet]
        [Route("{id:long}")]
        [HasPermission(Permissions.ViewEmployeeGroup)]
        [ProducesResponseType(typeof(ApiResponseModel<EmployeeGroupResponseDto>), 200)]
        public async Task<IActionResult> GetEmployeeGroupDetailsById(long id)
        {
            var response = await _employeeGroupService.GetEmployeeGroupDetailsById(id);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get list of Employee group
        /// </summary>
        /// <param name="requestDto">**Request parameter**</param>
        /// <response code="200">Return list of employee group</response>        
        [HttpPost]
        [Route("GetEmployeeGroupList")]
        [HasPermission(Permissions.ReadEmployeeGroup)]
        [ProducesResponseType(typeof(ApiResponseModel<EmployeeGroupSearchResponseDto>), 200)]
        public async Task<IActionResult> GetEmployeeGroupList(SearchRequestDto<EmployeeGroupSearchRequestDto> requestDto)
        {
            var response = await _employeeGroupService.GetEmployeeGroupList(requestDto);
            return StatusCode(response.StatusCode, response);
        }
    }
}