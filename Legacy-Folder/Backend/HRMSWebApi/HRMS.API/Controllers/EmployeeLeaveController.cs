using HRMS.API.Athorization;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Dashboard;
using HRMS.Models.Models.Leave;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Mvc;


namespace HRMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeLeaveController : ControllerBase
    {
        private readonly ILeaveManangementService _leaveManangementService;
      
        public EmployeeLeaveController(ILeaveManangementService leaveManangementService)
        {
            _leaveManangementService = leaveManangementService;
            
        }
        /// <summary>
        /// Get EmployeeLeaves
        /// </summary>
        /// <response code="200">Returns EmployeeLeaves list</response>
        [HttpGet]
        [Route("GetEmployeeLeave")]
        [ProducesResponseType(typeof(ApiResponseModel<List<LeaveTypeResponseDto>>), 200)]
        [HasPermission(Permissions.ReadLeave)]
        public async Task<IActionResult> GetEmployeeLeave()
        {
            var response = await _leaveManangementService.GetEmployeeLeavesList();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Applies for a leave request by an employee.
        /// </summary>
        /// <param name="request">The leave application details.</param>
        /// <returns>Returns success message if leave applied successfully, otherwise returns error message.</returns>
        /// <response code="200">Leave applied successfully</response>
        /// <response code="400">Invalid request</response>
        [HttpPost]
        [Route("ApplyLeave")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.CreateLeave)]
        public async Task<IActionResult> ApplyLeave([FromBody] EmployeeLeaveApplyRequestDto request)
        {
            var response = await _leaveManangementService.ApplyLeaveAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get leave history for a specific employee with pagination and optional date filtering
        /// </summary>
        /// <param name="employeeId">Employee ID</param>
        /// <param name="request">Search parameters (pagination, sort, date filter)</param>
        /// <returns>Paginated leave history</returns>
        [HttpPost]
        [Route("GetLeaveHistoryByEmployeeId/{employeeId}")]
        [ProducesResponseType(typeof(ApiResponseModel<List<LeaveHistoryTotalRecordsResponseDto>>), 200)]
        [HasPermission(Permissions.ReadLeave)]
        public async Task<IActionResult> GetLeaveHistoryByEmployeeId(long employeeId, [FromBody] SearchRequestDto<LeaveHistoryFilterDto> request)
        {
            var response = await _leaveManangementService.GetLeaveHistoryByEmployeeIdAsync(employeeId, request);
            return StatusCode(response.StatusCode, response);
        }


        /// <summary>
        /// Get Employees leaves detail using  Appliedleave table Id 
        /// </summary>
        /// <response code="200">Returns Employee Leaves Detail from appliedleave table </response>
        /// <response code="404">EmployeeId not found</response>
        [HttpGet]
        [Route("GetEmployeeLeaveDetail/{id:int}")]
        [ProducesResponseType(typeof(ApiResponseModel<EmployeeLeaveDetailResponseDto>), 200)]
        [HasPermission(Permissions.ReadLeave)]
        public async Task<IActionResult> GetEmployeeLeaveDetail(int id)
        {
            var response = await _leaveManangementService.GetEmpLeaveDetailById(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get leave balance for a specific employee and leave type
        /// </summary>
        /// <param name="requestDto">Leave Type ID</param>
        /// <response code="200">Returns the leave balance information</response>
        /// <response code="404">Leave balance not found</response>
        [HttpPost]
        [Route("GetEmployeeLeaveBalanceByType")]
        [ProducesResponseType(typeof(ApiResponseModel<GetAllLeaveBalanceResponseDto>), 200)]
        [HasPermission(Permissions.ReadLeave)]
        public async Task<IActionResult> GetEmployeeLeaveBalanceByType(GetAllLeaveBalanceRequestDto requestDto)
        {
            var response = await _leaveManangementService.GetLeaveBalanceByEmployeeAndLeaveId(requestDto);
            return StatusCode(response.StatusCode, response);
        }






        /// <summary>
        /// Is IsReportingManagerExist already exist
        /// </summary>
        /// <param name="EmployeeId">Employee Id</param>
        /// <response code="200">Returns boolean </response>
        /// <response code="404">user not found</response>
        [HttpGet]
        [Route("IsReportingManagerExist/{EmployeeId:long}")]
        //[ProducesResponseType(typeof(ApiResponseModel<EmployeeLeaveDetailResponseDto>), 200)]

        public async Task<IActionResult> IsReportingManagerExist(int EmployeeId)
        {
            var response = await _leaveManangementService.IsReportingManagerExist(EmployeeId);

            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Applies for a swap holiday request by an employee.
        /// </summary>
        /// <param name="request">The swap holiday application details.</param>
        /// <returns>Returns success message if swap applied successfully, otherwise returns error message.</returns>
        /// <response code="200">Swap holiday applied successfully</response>
        /// <response code="400">Invalid request</response>
        /// <response code="409">Duplicate swap application or swap limit exceeded</response>
        [HttpPost]
        [Route("ApplySwapHoliday")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.CreateLeave)]
        public async Task<IActionResult> ApplySwapHoliday([FromBody] SwapHolidayApplyRequestDto request)
        {
            var response = await _leaveManangementService.ApplySwapHolidayAsync(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Applies for a CompOff request by an employee.
        /// </summary>
        /// <param name="request">The CompOff application details.</param>
        /// <returns>Returns success message if CompOff applied successfully, otherwise returns error message.</returns>
        /// <response code="200">CompOff applied successfully</response>
        /// <response code="400">Invalid request</response>
        /// <response code="409">Duplicate CompOff application</response>
        [HttpPost]
        [Route("ApplyCompOff")]
        [ProducesResponseType(typeof(ApiResponseModel<CrudResult>), 200)]
        [HasPermission(Permissions.CreateLeave)]
        public async Task<IActionResult> ApplyCompOffRequest([FromBody] CompOffRequestDto request)
        {
            var response = await _leaveManangementService.ApplyCompOffAsync(request);
            return StatusCode(response.StatusCode, response);
        }


        /// <summary>
        /// Retrives for a CompOff and HolidaySwapOff request by an employee.
        /// </summary>
        /// /// <param name="EmployeeId">Get Employee SwapOff and CompOff Leave Based on EmployeeId.</param>
        /// <returns>Returns success message if Retrives successfully with , otherwise returns error message.</returns>
        /// <response code="200">Returns success message if Retrives successfully</response>
        [HttpGet]
        [Route("GetAllAdjustedLeaveByEmployee/{EmployeeId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<CompOffAndSwapResponseDto>), 200)]
        [HasPermission(Permissions.ReadLeave)]
        public async Task<IActionResult> GetAllAdjustedLeaveByEmployee(long EmployeeId)
        {
            var response = await _leaveManangementService.GetAllAdjustedLeaveByEmployeeAsync(EmployeeId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// </summary>
        /// <param name="EmployeeId">Employee ID to personalize holidays for.</param>
        /// <returns>Returns success message with personalized holidays if successful, otherwise error message.</returns>
        /// <response code="200">Returns success message with personalized holidays</response>
        [HttpGet]
        [Route("GetPersonalizedHolidayList/{EmployeeId:long}")]
        [ProducesResponseType(typeof(ApiResponseModel<HolidayResponseDto>), 200)]
        public async Task<IActionResult> GetPersonalizedHolidayList(long EmployeeId)
        {
            var response = await _leaveManangementService.GetPersonalizedHolidayListAsync(EmployeeId);
            return StatusCode(response.StatusCode, response);
        }



    }
}
