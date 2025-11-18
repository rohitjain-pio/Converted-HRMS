using System.Net;
using HRMS.API.Athorization;
using HRMS.Application.Services;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Grievance;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Mvc;
namespace HRMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GrievanceController : ControllerBase
    {
        private readonly IGrievanceService _grievanceService;

        private readonly IEmailNotificationService _email;

        public GrievanceController(IGrievanceService grievanceService, IUserProfileService userProfileService, IEmailNotificationService email)
        {
            _grievanceService = grievanceService;

            _email = email;


        }

        /// <summary>
        /// Retrieves a list of all active grievances with their owners and TATs
        /// </summary>
        /// <response code="200">Returns the list of grievances with owner details and TATs</response>
        [HttpGet]
        [Route("GetAllGrievancesList")]
        [ProducesResponseType(typeof(ApiResponseModel<GrievanceListResponseDTO>), 200)]
        [HasPermission(Permissions.ReadGrievancesConfiguration)]
        public async Task<IActionResult> GetAllGrievancesList()
        {
            var response = await _grievanceService.GetAllGrievances();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Retrieves a list of all active grievances with their owners and TATs
        /// </summary>
        /// <response code="200">Returns the list of grievances with owner details and TATs</response>
        [HttpGet]
        [Route("GetAllGrievanceTypeList")]
        [ProducesResponseType(typeof(ApiResponseModel<GrievanceTypeListDto>), 200)]
        [HasPermission(Permissions.CreateGrievances)]
        public async Task<IActionResult> GetAllGrievanceTypeList()
        {
            var response = await _grievanceService.GetAllGrievancesTypeAsync();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Retrieves a specific grievance type by its ID with owner details and TATs
        /// </summary>
        /// <param name="grievanceTypeId">The ID of the grievance type to retrieve</param>
        /// <response code="200">Returns the grievance type with owner details and TATs</response>
        /// <response code="404">Grievance type not found</response>
        [HttpGet]
        [Route("GetGrievanceTypeById/{grievanceTypeId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<GrievanceResponseDTO>), 200)]
        [HasPermission(Permissions.ReadGrievancesConfiguration)]
        public async Task<IActionResult> GetGrievanceTypeById(long grievanceTypeId)
        {
            var response = await _grievanceService.GetGrievanceTypeById(grievanceTypeId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Retrieves a paginated list of employee grievances based on provided filters.
        /// <param name="request"/>
        /// <param name="EmployeeId"/>
        /// Contains pagination, sorting, and filtering options such as grievance type and status.
        /// <response code="200">Successfully retrieved the list of employee grievances.</response>
        /// <response code="400">Invalid request or filters.</response>
        /// <response code="500">Internal server error.</response>
        /// </summary>
        [HttpPost]
        [Route("GetEmployeeGrievancesById/{EmployeeId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<EmployeeGrievanceResponseList>), 200)]
        [HasPermission(Permissions.ReadGrievances)]
        public async Task<IActionResult> GetEmployeeGrievances(long EmployeeId, [FromBody] SearchRequestDto<EmployeeGrievanceFilterDto> request)
        {
            var response = await _grievanceService.GetEmployeeGrievancesAsync(EmployeeId, request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Submits a new grievance for the logged-in employee
        /// </summary>
        /// <param name="request">Grievance details including type, title, description, and attachment</param>
        /// <returns>Auto-generated Ticket No</returns>
        /// <response code="201">Grievance submitted successfully</response>
        /// <response code="400">Submission failed</response>
        [HttpPost]
        [Route("SubmitGrievance")]
        [ProducesResponseType(typeof(ApiResponseModel<SubmitEmployeeGrievanceDto>), 201)]
        [HasPermission(Permissions.ReadGrievances)]
        public async Task<IActionResult> SubmitGrievance([FromForm] EmployeeGrievanceCreateDto request)
        {
            var response = await _grievanceService.SubmitGrievanceAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Delete grievance Type by Id
        /// </summary>
        /// <response code="200">Return 200 if Deleted successfully</response>
        [HttpPost]
        [Route("DeleteGrievance/{grievanceTypeId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.DeleteGrievances)]

        public async Task<IActionResult> DeleteGrievance(long grievanceTypeId)
        {
            var response = await _grievanceService.DeleteGrievance(grievanceTypeId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Adds a new grievance type with specified TAT levels and owners
        /// </summary>
        /// <param name="request">Grievance configuration details including name, TATs, and owner IDs</param>
        /// <returns>Result of the add operation</returns>
        /// <response code="200">Grievance type added successfully</response>
        [HttpPost]
        [Route("AddGrievance")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.ReadGrievancesConfiguration)]

        public async Task<IActionResult> AddGrievance([FromBody] GrievanceRequestDTO request)
        {
            var response = await _grievanceService.AddGrievance(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Updates an existing grievance type with new details
        /// </summary>
        /// <param name="request">Updated grievance configuration including name, TATs, and owner IDs</param>
        /// <returns>Result of the update operation</returns>
        /// <response code="200">Grievance type updated successfully</response>
        [HttpPost]
        [Route("UpdateGrievance")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.EditGrievances)]
        public async Task<IActionResult> UpdateGrievance([FromBody] GrievanceRequestDTO request)
        {
            var response = await _grievanceService.UpdateGrievance(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Retrieves detailed information for a specific employee grievance based on the ticket ID.
        /// <param name="TicketId">The unique ID of the grievance ticket.</param>
        /// <returns>An API response containing detailed grievance information.</returns>
        /// <response code="200">Grievance details fetched successfully.</response>    
        /// </summary>
        [HttpGet]
        [Route("GetEmployeeGrievancesDetail/{TicketId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<EmployeeGrievanceDetail>), 200)]
        [HasPermission(Permissions.ViewGrievances)]
        public async Task<IActionResult> GetEmployeeGrievancesDetail(long TicketId)
        {
            var response = await _grievanceService.GetEmployeeGrievancesDetailAsync(TicketId);
            return StatusCode(response.StatusCode, response);
        }



        /// <summary>
        /// Retrieves a paginated list of All Employee grievances based on provided filters.
        /// <param name="request"/>
        /// Contains pagination, sorting, and filtering options.
        /// <response code="200">Successfully retrieved the list of All employee grievances.</response>
        /// <response code="400">Invalid request or filters.</response>
        /// <response code="500">Internal server error.</response>
        /// </summary>
        [HttpPost]
        [Route("GetAllEmployeeGrievances")]
        [ProducesResponseType(typeof(ApiResponseModel<EmployeeListGrievanceResponseList>), 200)]
        [HasPermission(Permissions.ReadAllGrievances)]

        public async Task<IActionResult> GetAllEmployeeGrievances([FromBody] SearchRequestDto<EmployeeListGrievanceFilterDto> request)
        {
            var response = await _grievanceService.GetAllEmployeeGrievancesAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Sends Email when status of grievance = 3 (Resolved).
        /// <param name="ticketNo"/>
        /// <response code="200">Successfully retrieved the list of All employee grievances.</response>
        /// </summary>
        [HttpGet("GrievanceResolvedEmail/{ticketNo}")]
        public async Task<IActionResult> GrievanceResolvedEmail(string ticketNo)
        {
            await _email.GrievanceResolvedEmailAsync(ticketNo);
            return Ok(new { message = $"Grievance resolved email sent for TicketNo: {ticketNo}" });
        }


        //  <summary>
        ///  Retrieves the detailed remarks for a specific employee grievance ticket.
        /// <param name="ticketId">The ID of the grievance ticket.</param>
        /// <returns>Returns a detailed list of remarks associated with the grievance.</returns>
        /// <response code="200">Successfully retrieved the grievance remarks detail.</response>
        /// <summary/>
        [HttpGet]
        [Route("GetEmployeeGrievanceRemarksDetail/{ticketId}")]
        [ProducesResponseType(typeof(ApiResponseModel<EmployeeGrievanceRemarksDetail>), 200)]
        public async Task<IActionResult> GetEmployeeGrievanceRemarksDetail(long ticketId)
        {
            var response = await _grievanceService.GetEmployeeGrievanceRemarksDetailAsync(ticketId);

            return StatusCode(response.StatusCode, response);
        }



        /// <summary>
        /// Updates grievance status, remarks, and optionally escalates or resolves the grievance.
        /// </summary>
        /// <param name="request">
        /// Contains Ticket ID, remarks, optional attachment, and the new status (e.g., Resolved, Escalated).
        /// </param>
        /// <returns>Returns success or failure result of the grievance update operation.</returns>
        /// <response code="200">Grievance updated successfully.</response>
        /// <response code="400">Invalid request data.</response>
        /// <response code="403">User not authorized to update this grievance.</response>
        /// <response code="404">Grievance not found.</response>
        /// <response code="500">An unexpected error occurred while processing the grievance update.</response>
        [HttpPost]
        [Route("UpdateEmployeeGrievanceRemarks")]
        [ProducesResponseType(typeof(ApiResponseModel<bool>), 200)]
        public async Task<IActionResult> UpdateEmployeeGrievanceRemarks([FromForm] UpdateGrievanceRemarksRequestDto request)
        {
            var response = await _grievanceService.UpdateGrievanceAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        [HttpGet]
        [Route("UpdateRemarksAllowed")]
        [ProducesResponseType(typeof(ApiResponseModel<bool>), 200)]
        public async Task<IActionResult> UpdateRemarksAllowed(int grievanceTypeId, int level)
        {
            var response = await _grievanceService.UpdateRemarksAllowedAsync(grievanceTypeId, level);
            return StatusCode(response.StatusCode, response);
        }



        /// <summary>
        /// Get CSV, Excel, or PDF of paginated and filtered grievance records
        /// </summary>
        /// <param name="requestDto">Contains search filters for grievance type, status, created by, resolved by, dates, escalation count, and TAT status</param>
        /// <param name="format"></param>
        /// <returns>Returns the requested file format of grievance report</returns>
        [HttpPost]
        [Route("ExportGrievanceReport")]
        public async Task<IActionResult> ExportGrievanceReport([FromBody] SearchRequestDto<EmployeeListGrievanceFilterDto> requestDto, [FromQuery] string format = "excel")
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            var fileBytes = await _grievanceService.GetGrievanceReportInExcel(requestDto);
            var contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            var fileName = $"GrievanceReport_{timestamp}.xlsx";
            return File(fileBytes, contentType, fileName);
        }

        /// <summary>
        /// Checks if the user is allowed to view the grievance with the given ID.
        /// </summary>
        /// <param name="grievanceId">The ID of the grievance to check access for.</param>
        /// <returns>
        /// Returns an ApiResponseModel containing a boolean value:
        /// true if the user has permission to view the grievance, false otherwise.
        /// </returns>

        [HttpGet]
        [Route("GrievanceViewAllowed/{grievanceId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<bool>), 200)]
        public async Task<IActionResult> GrievanceViewAllowed(long grievanceId)
        {
            var response = await _grievanceService.GrievanceViewAllowedAsync(grievanceId);
            return StatusCode(response.StatusCode, response);
        }





    }
}




