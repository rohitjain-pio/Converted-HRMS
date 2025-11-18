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
using HRMS.Models.Models.AdminExitEmployee;

namespace HRMS.API.Controllers
{
    [Route("api/AdminExitEmployee")]
    [ApiController]
    public class AdminExitEmployeeController : ControllerBase
    {

        private readonly IAdminExitEmployeeService _adminExitEmployeeService;
        public AdminExitEmployeeController(IAdminExitEmployeeService adminExitEmployeeService)
        {
            _adminExitEmployeeService = adminExitEmployeeService;

        }

        /// <summary>
        /// List of Regisnation employee
        /// </summary>
        /// <response code="200">Return list of regisnation employee</response> 
        [HttpPost]
        [Route("GetResignationList")]
        [ProducesResponseType(typeof(ApiResponseModel<ExitEmployeeListResponseDTO>), 200)]

        public async Task<IActionResult> GetResignationList(SearchRequestDto<ResignationSearchRequestDto> searchRequestDto)
        {
            var response = await _adminExitEmployeeService.GetResignationList(searchRequestDto);
            return StatusCode(response.StatusCode, response);
        }


        /// <summary>
        /// Get resignation Detail
        /// </summary>
        /// <param name="id"></param>
        /// <response code="200">Returns resignation detail</response>
        /// <response code="404">Resignation detail not found</response>
        [HttpGet]
        [Route("GetResignationById/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<AdminExitEmployeeResponseDto>), 200)]
        public async Task<IActionResult> GetResignationDetailByEmpId(int id)
        {
            var response = await _adminExitEmployeeService.GetResignationById(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Accept Resignation
        /// </summary>
        /// <param name="id"></param>
        /// <response code="200">Resignation Accepted Successfully</response>
        /// <response code="404">Not Found</response>
        [HttpPost]
        [Route("AcceptResignation/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<AcceptResignationRequestDto>), 200)]
        public async Task<IActionResult> AcceptResignation(int id)
        {
            var response = await _adminExitEmployeeService.AdminAcceptResignation(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Accept Early Release
        /// </summary>
        /// <param name="requestDto"></param>
        /// <response code="200">Early Release Accepted Successfully</response>
        /// <response code="404">Not Found</response>

        [HttpPost]
        [Route("AcceptEarlyRelease")]
        [ProducesResponseType(typeof(ApiResponseModel<String>), 200)]
        public async Task<IActionResult> AcceptEarlyRelease(AcceptEarlyReleaseRequestDto requestDto)
        {
            var response = await _adminExitEmployeeService.AdminAcceptEarlyRelease(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get IT Clearance Detail
        /// <response code="200"> Successfully sent data</response>
        /// <response code="404">Not Found</response>
        /// </summary>
        [HttpGet]
        [Route("GetITClearanceDetailByResignationId/{resignationId:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<ITClearanceResponseDTO>), 200)]
        public async Task<IActionResult> GetITClearanceDetailByResignationId(int resignationId)
        {
            var response = await _adminExitEmployeeService.GetITClearanceDetailByResignationId(resignationId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Admin reject request for Resignation or early release
        /// <response code="200">Reject Resignation request or early release request</response>
        /// <response code="404">Resignation detail not found</response>
        /// </summary>
        [HttpPost]
        [Route("AdminRejection")]
        [ProducesResponseType(typeof(ApiResponseModel<String>), 200)]
        public async Task<IActionResult> AdminRejection(AdminRejectionRequestDto requestDto)
        {
            var response = await _adminExitEmployeeService.AdminRejectRequest(requestDto);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get HR Clearance detail by Resignation ID
        /// </summary>
        /// <param name="resignationId">Resignation ID</param>
        /// <response code="200">Returns HR clearance detail</response>
        /// <response code="404">HR clearance detail not found</response>
        [HttpGet]
        [Route("GetHRClearanceByResignationId/{resignationId:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<HRClearanceResponseDto>), 200)]
        public async Task<IActionResult> GetHRClearanceDetailByResignationId(int resignationId)
        {
            var response = await _adminExitEmployeeService.GetHRClearanceByResignationId(resignationId);
            return StatusCode(response.StatusCode, response);
        }


        /// <summary>
        /// Add update in IT Clearance
        /// <response code="200"> Return IT Clearance detail</response>
        /// <response code="404"> Not Found</response>
        /// </summary>
        
        [HttpPost]
        [Route("AddUpdateITClearance")]
        [ProducesResponseType(typeof(ApiResponseModel<String>), 200)]
        public async Task<IActionResult> AddUpdateITClearance(ITClearanceRequestDTO requestDTO)
        {
            var response = await _adminExitEmployeeService.AddUpdateITClearanceById(requestDTO);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get Account Clearance Detail
        /// <response code="200"> Successfully sent data</response>
        /// <response code="404">Not Found</response>
        /// </summary>
        [HttpGet]
        [Route("GetAccountClearance/{resignationId:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<ITClearanceResponseDTO>), 200)]
        public async Task<IActionResult> GetAccountClearance(int resignationId)
        {
            var response = await _adminExitEmployeeService.GetAccountClearanceById(resignationId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Add update in Account Clearance
        /// <response code="200"> Successfully Updated</response>
        /// <response code="404"> Not Found</response>
        /// </summary>

        [HttpPost]
        [Route("AddUpdateAccountClearance")]
        [ProducesResponseType(typeof(ApiResponseModel<String>), 200)]
        public async Task<IActionResult> AddUpdateAccountClearance(AccountClearanceRequestDto requestDTO)
        {
            var response = await _adminExitEmployeeService.AddUpdateAccountClearanceById(requestDTO);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Admin update request for Resignation Last Working Day
        /// <response code="200">Updated last working day successfully</response>
        /// <response code="404">Resignation not found</response>
        /// </summary>
        [HttpPatch]
        [Route("UpdateLastWorkingDay")]
        [ProducesResponseType(typeof(ApiResponseModel<String>), 200)]
        public async Task<IActionResult> UpdateLastWorkingDay(UpdateLastWorkingDayRequestDto requestDto)
        {
            var response = await _adminExitEmployeeService.UpdateLastWorkingDay(requestDto);
            return StatusCode(response.StatusCode, response);
        }
          
 
        /// <summary>
        /// Add or Update HR Clearance Details
        /// </summary>
        /// <param name="requestDto">HR clearance data</param>
        /// <response code="200">Insert or update success</response>
        /// <response code="404">Resignation not found</response>
        [HttpPost]
        [Route("UpsertHRClearance")]
        [ProducesResponseType(typeof(ApiResponseModel<string>), 200)]
        public async Task<IActionResult> UpsertHRClearance(HRClearanceRequestDto requestDto)
        {
            var response = await _adminExitEmployeeService.UpsertHRClearance(requestDto);
            return StatusCode(response.StatusCode, response);
        }
 
        /// <summary>
        /// Get Department Clearance detail by Resignation ID
        /// </summary>
        /// <param name="resignationId">Resignation ID</param>
        /// <response code="200">Returns Department clearance detail</response>
        /// <response code="404">Department clearance detail not found</response>
        [HttpGet]
        [Route("GetDepartmentClearanceDetailByResignationId/{resignationId:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<DepartmentClearanceResponseDto>), 200)]
        public async Task<IActionResult> GetDepartmentClearanceDetailByResignationId(int resignationId)
        {
            var response = await _adminExitEmployeeService.GetDepartmentClearanceByResignationId(resignationId);
            return StatusCode(response.StatusCode, response);
        }
 
        /// <summary>
        /// Add or Update Department Clearance Details
        /// </summary>
        /// <param name="requestDto">Department clearance details</param>
        /// <response code="200">Insert or update success</response>
        /// <response code="404">Resignation not found</response>
        [HttpPost]
        [Route("UpsertDepartmentClearance")]
        [ProducesResponseType(typeof(ApiResponseModel<string>), 200)]
        public async Task<IActionResult> UpsertDepartmentClearance(DepartmentClearanceRequestDto requestDto)
        {
            var response = await _adminExitEmployeeService.UpsertDepartmentClearance(requestDto);
            return StatusCode(response.StatusCode, response);
        }
 
    }
}
