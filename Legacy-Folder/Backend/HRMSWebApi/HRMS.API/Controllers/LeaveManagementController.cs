using HRMS.API.Athorization;
using HRMS.API.Validations;
using HRMS.Application.Services;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Attendance;
using HRMS.Models.Models.Leave;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Quartz;
using System.Net;

namespace HRMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaveManagementController : ControllerBase
    {
        private readonly ILeaveManangementService _leaveManangementService;
        private readonly ISchedulerFactory _schedulerFactory;
        public LeaveManagementController(ILeaveManangementService leaveManangementService, ISchedulerFactory schedulerFactory)
        {
            _leaveManangementService = leaveManangementService;
            _schedulerFactory = schedulerFactory;
            
        }
        /// <summary>
        /// Get EmployeeLeaves
        /// </summary>
        /// <response code="200">Returns EmployeeLeaves list</response>
        /// <response code="404">Employment details not found</response>
        [HttpGet]
        [Route("GetEmployeeLeaveById/{employeeId:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<EmployeeLeaveResponseDto>), 200)]
        [HasPermission(Permissions.ReadLeave)]
        public async Task<IActionResult> GetEmployeeLeaveById(int employeeId)
        {
            var response = await _leaveManangementService.GetEmployeeLeavesById(employeeId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update Leave details
        /// </summary>
        /// <param name="request">**Request Parameters**</param>
        /// <response code="200">Return 200 status for successfully update</response>
        /// <response code="404">Employment details not found</response>
        /// <response code="400">Error in updating Leave details</response>  
        [HttpPost]
        [Route("UpdateLeaves")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.EditLeave)]
        public async Task<IActionResult> UpdateLeaves(EmployeeLeaveRequestDto request)
        {
            var response = await _leaveManangementService.UpdateLeaveBalance(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get Accrual and Utilized leaves
        /// </summary>
        /// <response code="200">Returns list of leaves (Accrual and Utilized) for an Employee</response>
        /// <response code="404">EmployeeId not found</response>
        [HttpPost]
        [Route("GetAccrualsUtilized/{employeeId:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<AccrualsUtilizedListResponseDto>), 200)]
        [HasPermission(Permissions.ReadLeave)]

        public async Task<IActionResult> GetAccrualsUtilized(int employeeId, SearchRequestDto<AccrualLeaveSearchRequestDto> requestDto)
        {
            var response = await _leaveManangementService.GetAccrualsUtilizedById(employeeId, requestDto);
            return StatusCode(response.StatusCode, response);
        }




        /// <summary>
        /// Retrieves a calendar view of employee leaves for a specified month based on provided filters.
        /// </summary>
        /// <param name="requestDto">Search filters including date, employee ID, leave type, department, and status.</param>
        /// <returns>Returns a calendar summary of approved and pending leaves per day.</returns>
        /// <response code="200">Returns the leave calendar data successfully.</response>

        [HttpPost]
        [Route("GetCalendarLeaves")]
        [HasPermission(Permissions.ReadLeaveCalendar)]

        public async Task<IActionResult> GetMonthlyLeaveCalendar(LeaveCalendarSearchRequestDto requestDto)
        {

            var response = await _leaveManangementService.GetMonthlyLeaveCalendarAsync(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get all Employee Leave Types
        /// </summary>
        /// <response code="200">Returns list of leave types for employees</response>

        [HttpGet]
        [Route("GetEmployeeLeaveTypes")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<LeaveTypeResponseDto>>), 200)]
        [HasPermission(Permissions.ReadLeave)]
        public async Task<IActionResult> GetEmployeeLeaveTypes()
        {
            var response = await _leaveManangementService.GetEmployeeLeavesList();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>    
        /// Get filtered and paginated Applied Leaves
        /// </summary>
        /// <param name="searchRequest">The search filter and pagination information for applied leaves.</param>
        /// <returns>Returns a paginated list of applied leave records that match the search filters.</returns>
        /// <response code="200">Returns filtered AppliedLeaves list</response>
        [HttpPost]
        [Route("GetAppliedLeaves")]
        [ProducesResponseType(typeof(ApiResponseModel<GetAppliedLeavesTotalRecordsDto>), 200)]
        [HasPermission(Permissions.ReadLeave)]
        public async Task<IActionResult> GetAppliedLeaves([FromBody] SearchRequestDto<AppliedLeaveSearchRequestDto> searchRequest)
        {
            var response = await _leaveManangementService.GetFilteredAppliedLeavesList(searchRequest);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get Employee leave balance by EmployeeId
        /// </summary>
        /// <response code="200">Returns list of leaves along with leaveType for an Employee</response>
        /// <response code="404">EmployeeId not found</response>
        [HttpGet]
        [Route("GetEmployeeLeaveBalanceById/{employeeId:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<EmpLeaveBalanceListResponseDto>), 200)]
        [HasPermission(Permissions.ReadLeave)]
        // [HasPermission(Permissions.ReadPersonalDetails)] 
        public async Task<IActionResult> GetEmployeeLeaveBalanceById(int employeeId)
        {
            var response = await _leaveManangementService.GetLeaveBalanceById(employeeId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Approves an applied leave and logs to AccrualUtilizedLeave
        /// </summary>
        [HttpPost]
        [Route("ApproveOrRejectLeave")]
        [HasPermission(Permissions.ReadLeaveApproval)]
        public async Task<IActionResult> ApproveOrRejectLeave(LeaveApprovalDto request)
        {
            var result = await _leaveManangementService.ApproveOrRejectLeaveAsync(request);
            return StatusCode(result.StatusCode, result);
        }

        /// <summary>
        /// Import Employee Leave Excel
        /// </summary>
        /// <param name="leaveExcelFile">Excel file containing leave data</param>
        /// <param name="importConfirmed">Flag to confirm final import</param>
        /// <returns></returns>
        [HttpPost]
        [Route("ImportLeaveExcel")]
        // [HasPermission(Permissions.CreateEmployees)]
        public async Task<IActionResult> ImportLeaveExcel(IFormFile leaveExcelFile, bool importConfirmed)
        {
            var response = await _leaveManangementService.ImportEmployeeLeaveExcel(leaveExcelFile, importConfirmed);
            return StatusCode(response.StatusCode, response);
        }



        /// <summary>
        /// Get Employees leave Request by Reporting Manager id
        /// </summary>
        /// <response code="200">Returns Employee Leaves  by ReportingManagerId </response>
        /// <response code="404">ReportingManagerId not found</response>
        [HttpPost]
        [Route("GetEmployeeLeaveRequest")]
        [ProducesResponseType(typeof(ApiResponseModel<LeaveRequestListResponseDto>), 200)]
        [HasPermission(Permissions.ReadLeaveApproval)]
        public async Task<IActionResult> GetEmployeeLeaveRequest( SearchRequestDto<GetLeaveRequestSearchRequestDto> requestDto)
        {
            var response = await _leaveManangementService.GetEmployeeLeaveRequestById( requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Trigger Cron Job for Leave Balance
        /// </summary>
        [HttpPost]
        [Route("TriggerCronForLeaveBalance")]
        public async Task<IActionResult> TriggerCronForLeaveBalance(bool elapseLeaves ,int forMonth , int forYear)
        {
            
            var scheduler = await _schedulerFactory.GetScheduler();
            var jobKey = new JobKey(QuartzConstants.MonthlyCreditLeaveBalanceJobKey);
 
           if (await scheduler.CheckExists(jobKey))
            {
                var dataMap = new JobDataMap
                {
                    { "elapseLeaves", elapseLeaves},
                    { "forMonth",forMonth },
                    { "forYear",forYear }
                   
                };
                await scheduler.TriggerJob(jobKey, dataMap);
                return Ok(SuccessMessage.JobTriggered);
            }

            return NotFound(ErrorMessage.JobNotFound);
        }



        /// <summary>
        /// Get Comp Off and Swap Holiday Requests by Reporting Manager Id
        /// </summary>
        /// <response code="200">Returns Comp Off and Swap Holiday Requests by ReportingManagerId</response>
        /// <response code="404">ReportingManagerId not found</response>
        [HttpPost]
        [Route("GetCompOffAndSwapHolidayDetails")]
        [ProducesResponseType(typeof(ApiResponseModel<CompOffAndSwapHolidayListResponseDto>), 200)]
        
        public async Task<IActionResult> GetCompOffAndSwapHolidayDetails(SearchRequestDto<CompOffAndSwapHolidaySearchRequestDto> requestDto)
        {
            var response = await _leaveManangementService.GetCompOffAndSwapHolidayDetailsById(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Approves an applied leave and logs to AccrualUtilizedLeave
        /// </summary>
        [HttpPost]
        [Route("ApproveOrRejectCompOffSwapHoliday")]
        [HasPermission(Permissions.ReadLeaveApproval)]
        public async Task<IActionResult> ApproveOrRejectCompOffSwapHoliday(CompOffAndSwapHolidayDetailRequestDto request)
        {
            var result = await _leaveManangementService.ApproveOrRejectCompOffSwapHoliday(request);
            return StatusCode(result.StatusCode, result);
        }
    }
}
