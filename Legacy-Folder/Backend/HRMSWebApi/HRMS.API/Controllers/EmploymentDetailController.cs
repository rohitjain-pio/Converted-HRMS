using FluentValidation;
using HRMS.API.Athorization;
using HRMS.API.Validations;
using HRMS.Application.Services;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace HRMS.API.Controllers
{
    [Route("api/UserProfile")]
    [ApiController]
    [HasPermission(Permissions.ReadEmploymentDetails)]
    public class EmploymentDetailController : ControllerBase
    {
        private readonly IEmploymentDetailService _employmentDetailService;
        private readonly EmploymentRequestValidation _EmploymentRequestValidation;
        private readonly AddEmploymentRequestValidation _AddEmploymentRequestValidation;
        private readonly CurrentEmployerDocValidation _CurrentEmployerDocValidation;
        private readonly IUserProfileService _UserProfileService;
        private readonly DepartmentRequestValidation _DepartmentRequestValidation;
        private readonly TeamRequestValidation _teamRequestValidation;
        private readonly DesignationRequestValidation _designationRequestValidation;

        public EmploymentDetailController(IEmploymentDetailService employmentDetailService, EmploymentRequestValidation employmentRequestValidation, CurrentEmployerDocValidation currentEmployerDocValidation, IUserProfileService userProfileService, DepartmentRequestValidation departmentRequestValidation, TeamRequestValidation teamRequestValidation, AddEmploymentRequestValidation AddEmploymentRequestValidatio, DesignationRequestValidation designationRequestValidation)
        {
            _employmentDetailService = employmentDetailService;
            _EmploymentRequestValidation = employmentRequestValidation;
            _CurrentEmployerDocValidation = currentEmployerDocValidation;
            _UserProfileService = userProfileService;
            _DepartmentRequestValidation = departmentRequestValidation;
            _teamRequestValidation = teamRequestValidation;
            _AddEmploymentRequestValidation = AddEmploymentRequestValidatio;
            _designationRequestValidation = designationRequestValidation;
            
        }
        /// <summary>
        /// Get employee Timedoctor user id
        /// </summary>
        /// <param name="email"></param>
        /// <response code="200">Employee Timedoctor user id fetched successfully</response>
        /// <response code="404">Employee Timedoctor user id not found</response>
        [HttpGet]
        [Route("GetEmployeeTimedoctorUserId")]
        [HasPermission(Permissions.CreateEmploymentDetails)]
        public async Task<IActionResult> GetEmployeeTimedoctorUserId(string email)
        {
            var response = await _employmentDetailService.GetEmployeeTimedoctorUserId(email);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Save employment details
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Employment details is saved successfully</response>
        /// <response code="400">Error in saving employment detail</response>
        [HttpPost]
        [Route("AddEmploymentDetail")]
        [HasPermission(Permissions.CreateEmploymentDetails)]
        public async Task<IActionResult> AddEmploymentDetail(AddEmploymentDetailRequestDto request)
        {
            var validationResult = await _AddEmploymentRequestValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }

            var response = await _employmentDetailService.AddEmploymentDetail(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update employment details
        /// </summary>
        /// <param name="request">**Request Parameters**</param>
        /// <response code="200">Return 200 status for successfully update</response>
        /// <response code="404">Employment details not found</response>
        /// <response code="400">Error in updating emplyment details</response>  
        [HttpPost]
        [Route("UpdateEmploymentDetail")]
        [HasPermission(Permissions.EditEmploymentDetails)]
        public async Task<IActionResult> UpdateEmploymentDetail(EmploymentRequestDto request)
        {
            var validationResult = await _EmploymentRequestValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }

            var response = await _employmentDetailService.UpdateEmploymentDetail(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// ArchiveUnarchive employment details
        /// </summary>
        /// <param name="employeeArchiveRequestDto">**Request Parameters**</param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Employment details not found</response>    
        [HttpDelete]
        [Route("ArchiveUnarchiveEmploymentDetails")]
        [HasPermission(Permissions.DeleteEmploymentDetails)]
        public async Task<IActionResult> ArchiveUnarchiveEmploymentDetails(EmployeeArchiveRequestDto employeeArchiveRequestDto)
        {
            var response = await _employmentDetailService.ArchiveUnarchiveEmploymentDetails(employeeArchiveRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get employment details by Id
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Returns employment details</response>
        /// <response code="400">Employment details not found</response> 
        [HttpGet]
        [Route("GetEmploymentDetailById")]
        [ProducesResponseType(typeof(ApiResponseModel<EmploymentResponseDto>), 200)]
        [HasPermission(Permissions.ReadEmploymentDetails)]
        public async Task<IActionResult> GetEmplyementDetailById(long id)
        {
            var response = await _employmentDetailService.GetEmplyementDetailById(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Upload current employer document
        /// </summary>
        /// <param name="currentEmployerDocRequestDto">**Request Parameters**</param>
        /// <response code="200">Return 200 status for successfully upload</response>       
        /// <response code="404">Current employer not found</response>  
        [HttpPost]
        [Route("UploadCurrentEmployerDocument")]
        [HasPermission(Permissions.CreateEmploymentDetails)]
        public async Task<IActionResult> UploadCurrentEmployerDocument([FromForm] CurrentEmployerDocRequestDto currentEmployerDocRequestDto)
        {
            var validationResult = await _CurrentEmployerDocValidation.ValidateAsync(currentEmployerDocRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _employmentDetailService.UploadCurrentEmployerDocument(currentEmployerDocRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get list of employer document type
        /// </summary>
        /// <response code="200">Return list of employer document type</response>
        /// <response code="404">Employer document type list not found</response>     
        [HttpGet]
        [Route("GetEmployerDocumentTypeList/{documentFor:int}")]
        [HasPermission(Permissions.ReadEmploymentDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<EmployerDocumentTypeResponseDto>>), 200)]
        public async Task<IActionResult> GetEmployerDocumentTypeList(int documentFor)
        {
            if (documentFor >= (int)DocumentFor.Previous && documentFor <= (int)DocumentFor.Current)
            {
                var response = await _employmentDetailService.GetEmployerDocumentTypeList(documentFor);
                return StatusCode(response.StatusCode, response);
            }
            else
            {
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.InvalidEmployerDocumentTypeCount, null
                ));
            }
        }

        /// <summary>
        /// Delete Employment details
        /// </summary>
        /// <param name="Id">**long**</param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Employment details not found</response>     
        [HttpDelete]
        [Route("DeleteEmploymentDetails/{id:long}")]
        [HasPermission(Permissions.DeleteEmploymentDetails)]
        public async Task<IActionResult> DeleteEmploymentDetails(long Id)
        {
            var response = await _employmentDetailService.DeleteEmploymentDetails(Id);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Add Department 
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Department is saved successfully</response>
        /// <response code="400">Error in saving Department</response>
        [HttpPost]
        [Route("AddDepartment")]
        [HasPermission(Permissions.CreateEmploymentDetails)]
        public async Task<IActionResult> AddDepartment(DepartmentRequestDto request)
        {
            var validationResult = await _DepartmentRequestValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _UserProfileService.AddDepartment(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Save Team 
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Team is saved successfully</response>
        /// <response code="400">Error in saving Team </response>
        [HttpPost]
        [Route("AddTeam")]
        [HasPermission(Permissions.CreateEmploymentDetails)]
        public async Task<IActionResult> AddTeam(TeamRequestDto request)
        {
            var validationResult = await _teamRequestValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _UserProfileService.AddTeam(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update Team
        /// </summary>
        /// <param name="request">**Request Parameters**</param>
        /// <response code="200">Return 200 status for successfully update</response>
        /// <response code="400">Error in updating Team</response> 
        [HttpPost]
        [Route("UpdateTeam")]
        [HasPermission(Permissions.EditEmploymentDetails)]
        public async Task<IActionResult> UpdateTeam(TeamRequestDto request)
        {
            var validationResult = await _teamRequestValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _UserProfileService.UpdateTeam(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Delete Team
        /// </summary>
        /// <param name="archiveTeamRequestDto">**long**</param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Team not found</response>  
        [HttpDelete]
        [Route("ArchiveUnarchiveTeam")]
         [HasPermission(Permissions.DeleteEmploymentDetails)]
        public async Task<IActionResult> ArchiveUnarchiveTeam(ArchiveTeamRequestDto archiveTeamRequestDto)
        {
            var response = await _employmentDetailService.ArchiveUnarchiveTeam(archiveTeamRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Edit Department 
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Department is Updated successfully</response>
        /// <response code="400">Error in saving Department</response>
        [HttpPost]
        [Route("EditDepartment")]
        public async Task<IActionResult> EditDepartment(DepartmentRequestDto request)
        {
            var validationResult = await _DepartmentRequestValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _UserProfileService.EditDepartment(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        ///  Archive Unarchive Department details
        /// </summary>
        /// <param name="departmentArchiveRequestDto">**long**</param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Department details not found</response>     
        [HttpDelete]
        [Route("ArchiveUnarchiveDepartment")]
        public async Task<IActionResult> ArchiveUnarchiveDepartment(DepartmentArchiveRequestDto departmentArchiveRequestDto)
        {
            var response = await _employmentDetailService.ArchiveUnarchiveDepartment(departmentArchiveRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get reporting manager
        /// </summary>
        /// <response code="200">Returns reporting manager list</response>
        [HttpGet]
        [Route("GetReportingManagerList")]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<ReportingManagerResponseDto>>), 200)]
        [HasPermission(Permissions.ReadEmploymentDetails)]
        public async Task<IActionResult> GetReportingManagerList(string? name, int? RoleId)
        {
            var response = await _UserProfileService.GetReportingManagerList(name,RoleId);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get Designation list
        /// </summary>
        /// <response code="200">Returns branch list</response>
        [HttpGet]
        [Route("GetDesignationList")]
        [HasPermission(Permissions.ReadEmploymentDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<DesignationResponseDto>>), 200)]
        public async Task<IActionResult> GetDesignationList()
        {
            var response = await _UserProfileService.GetDesignationList();
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get Department By Id 
        ///
        ///  
        /// </summary>
        /// <response code="200">Returns Department By Id  </response>
        [HttpGet]
        [Route("GetDepartmentById")]
        [HasPermission(Permissions.ViewEmploymentDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<DepartmentResponseDto>>), 200)]
        public async Task<IActionResult> GetDepartmentById(long id)
        {
            var response = await _UserProfileService.GetDepartmentById(id);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get Team By Id 
        /// </summary>
        /// <response code="200">Returns Team  By Id  </response>
        [HttpGet]
        [Route("GetTeamById")]
        [HasPermission(Permissions.ViewEmploymentDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<TeamResponseDto>>), 200)]
        public async Task<IActionResult> GetTeamById(long id)
        {
            var response = await _UserProfileService.GetTeamById(id);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Funtion to get list of Department in application
        /// </summary>
        /// <param name="request">**Request parameter**</param>
        /// <response code="200">Return page list of all Departments</response>
        [HttpPost]
        [Route("GetDepartments")]
        [HasPermission(Permissions.ReadEmploymentDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<DepartmentSearchResponseDto>), 200)]
        public async Task<IActionResult> GetDepartments(SearchRequestDto<DepartmentSearchRequestDto> request)
        {
            var response = await _UserProfileService.GetDepartment(request);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Funtion to get list of Teams in application
        /// </summary>
        /// <param name="request">**Request parameter**</param>
        /// <response code="200">Return page list of all Teams</response>
        [HttpPost]
        [Route("GetTeams")]
        [HasPermission(Permissions.ReadEmploymentDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<TeamResponseDto>), 200)]
        public async Task<IActionResult> GetTeams(SearchRequestDto<TeamSearchRequestDto> request)
        {
            var response = await _UserProfileService.GetTeams(request);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Add Designation 
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Designation is saved successfully</response>
        /// <response code="400">Error in saving Designation</response>
        [HttpPost]
        [Route("AddDesignation")]
        [HasPermission(Permissions.CreateEmploymentDetails)]
        public async Task<IActionResult> AddDesignation(DesignationRequestDto request)
        {
            var validationResult = await _designationRequestValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _UserProfileService.AddDesignation(request);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Get Designation By Id 
        ///
        ///  
        /// </summary>
        /// <response code="200">Returns Designation By Id  </response>
        [HttpGet]
        [Route("GetDesignationById")]
        [HasPermission(Permissions.ViewEmploymentDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<DesignationResponseDto>>), 200)]
        public async Task<IActionResult> GetDesignationById(long id)
        {
            var response = await _UserProfileService.GetDesignationById(id);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Edit Designation 
        /// </summary>
        /// <param name="request"></param>
        /// <response code="200">Designation is Updated successfully</response>
        /// <response code="400">Error in saving Designation</response>
        [HttpPost]
        [Route("EditDesignation")]
        public async Task<IActionResult> EditDesignation(DesignationRequestDto request)
        {
            var validationResult = await _designationRequestValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _UserProfileService.EditDesignation(request);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        ///  Archive Unarchive Designation details
        /// </summary>
        /// <param name="designationArchiveRequestDto">**long**</param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Designation details not found</response>     
        [HttpDelete]
        [Route("ArchiveUnarchiveDesignation")]
        public async Task<IActionResult> ArchiveUnarchiveDesignation(DesignationArchiveRequestDto designationArchiveRequestDto)
        {
            var response = await _employmentDetailService.ArchiveUnarchiveDesignation(designationArchiveRequestDto);
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        /// Funtion to get list of Designation in application
        /// </summary>
        /// <param name="request">**Request parameter**</param>
        /// <response code="200">Return page list of all Designation</response>
        [HttpPost]
        [Route("GetDesignation")]
        [HasPermission(Permissions.ReadEmploymentDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<DesignationSearchRequestDto>), 200)]
        public async Task<IActionResult> GetDesignation(SearchRequestDto<DesignationSearchRequestDto> request)
        {
            var response = await _UserProfileService.GetDesignation(request);
            return StatusCode(response.StatusCode, response);
        }
        
        /// <summary>
        /// Funtion to get latest employee code
        /// </summary>
        /// <response code="200">Returns latest employee code</response>
        [HttpGet]
        [Route("GetLatestEmployeeCode")]
        [HasPermission(Permissions.ReadEmploymentDetails)]
        [ProducesResponseType(typeof(ApiResponseModel<string>), 200)]
        public async Task<IActionResult> GetLatestEmployeeCode()
        {
            var response = await _UserProfileService.GetLatestEmpCode();
            return StatusCode(response.StatusCode, response);
        }

      
    }
}