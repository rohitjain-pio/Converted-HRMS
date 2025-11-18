using HRMS.API.Athorization;
using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Models;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace HRMS.API.Controllers
{
    [Route("api/Employee")]
    [ApiController]
    [Produces("application/json")]
    [HasPermission(Permissions.ReadEmployees)]
    public class EmployeeController : ControllerBase
    {
        private readonly IUserProfileService _userProfileService;

        public EmployeeController(IUserProfileService userProfileService)
        {
            _userProfileService = userProfileService;
            
        }
        /// <summary>
        /// Funtion to get list of employee in application
        /// </summary>
        /// <param name="request">**Request parameter**</param>
        /// <response code="200">Return page list of all employees</response>
        [HttpPost]
        [Route("GetEmployees")]
        [HasPermission(Permissions.ReadEmployees)]
        [ProducesResponseType(typeof(ApiResponseModel<EmployeeListSearchResponseDto>), 200)]
        public async Task<IActionResult> GetEmployees(SearchRequestDto<EmployeeSearchRequestDto> request)
        {
            var response = await _userProfileService.GetEmployees(request);
            return StatusCode(response.StatusCode, response);
        }

        [HttpPost("export")]
        [HasPermission(Permissions.ViewEmployees)]
        public async Task<IActionResult> ExportEmployeeListToExcel([FromBody] SearchRequestDto<EmployeeSearchRequestDto> employeeSearchRequestDto)
        {
            var excelData = await _userProfileService.ExportEmployeeListToExcel(employeeSearchRequestDto);

            var contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            var fileName = $"EmployeeList_{timestamp}.xlsx";

            return File(excelData, contentType, fileName);
        }
        /// <summary>
        /// Import excel file
        /// </summary>
        /// <response code="200">Import excel file</response> 
        [HttpPost]
        [Route("ImportExcel")]
        [HasPermission(Permissions.CreateEmployees)]
        public async Task<IActionResult> ImportExcel(IFormFile excefile, bool importConfirmed)
        {
            
            var response = await _userProfileService.ImportExcelForEmployes(excefile, importConfirmed);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get Departments list
        /// </summary>
        /// <response code="200">Returns Department list</response>
        [HttpGet]
        [Route("GetDepartmentList")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<DepartmentResponseDto>>), 200)]
        [HasPermission(Permissions.ReadEmployees)]
        public async Task<IActionResult> GetDepartmentList()
        {
            var response = await _userProfileService.GetDepartmentList();
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get Team list
        /// </summary>
        /// <response code="200">Returns Team list</response>
        [HttpGet]
        [Route("GetTeamList")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<TeamResponseDto>>), 200)]
        [HasPermission(Permissions.ReadEmployees)]
        public async Task<IActionResult> GetTeamList()
        {
            var response = await _userProfileService.GetTeamList();
            return StatusCode(response.StatusCode, response);
        }
    }
}
