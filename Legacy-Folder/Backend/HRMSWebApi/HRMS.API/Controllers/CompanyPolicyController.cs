using HRMS.API.Athorization;
using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Models.Models.CompanyPolicy;
using HRMS.Models.Models.Dashboard;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace HRMS.API.Controllers
{
    [Route("api/CompanyPolicy")]
    [HasPermission(Permissions.ReadCompanyPolicy)]
    [ApiController]
    public class CompanyPolicyController(ICompanyPolicyService companyPolicyService, CompanyPolicyRequestValidation validations) : ControllerBase
    {
        private readonly ICompanyPolicyService _companyPolicyService = companyPolicyService;
        private readonly CompanyPolicyRequestValidation _validations = validations;

        /// <summary>
        /// Save company policy
        /// </summary>
        /// <param name="companyPolicyRequestDto"></param>
        /// <response code="200">Company policy is saved successfully</response>
        /// <response code="400">Error is saving company policy</response>
        [HttpPost]
        [Route("CreateCompanyPolicy")]
        [HasPermission(Permissions.CreateCompanyPolicy)]
        [ProducesResponseType(typeof(ApiResponseModel<CompanyPolicyResponseDto>), 200)]
        public async Task<IActionResult> Post([FromForm] CompanyPolicyRequestDto companyPolicyRequestDto)
        {
            var validationResult = await _validations.ValidateAsync(companyPolicyRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _companyPolicyService.Add(companyPolicyRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get company policy by Id
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Returns company policy</response>
        /// <response code="404">Company policy not found</response>
        [ProducesResponseType(typeof(ApiResponseModel<CompanyPolicyResponseDto>), 200)]
        [HttpGet]
        [Route("{id:long}")]
        [HasPermission(Permissions.ViewCompanyPolicy)]
        public async Task<IActionResult> GetCompanyPolicyById(long id)
        {
            var response = await _companyPolicyService.GetCompanyPolicyById(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get list of company policies
        /// </summary>
        /// <param name="requestDto">**Request parameter**</param>
        /// <response code="200">Return list of company policies</response>
        [HttpPost]
        [Route("GetCompanyPolicies")]
        [HasPermission(Permissions.ReadCompanyPolicy)]
        [ProducesResponseType(typeof(ApiResponseModel<CompanyPolicySearchResponseDto>), 200)]
        public async Task<IActionResult> GetCompanyPolicies(SearchRequestDto<CompanyPolicySearchRequestDto> requestDto)
        {
            var response = await _companyPolicyService.GetCompanyPolicies(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get list of policy status
        /// </summary>
        /// <response code="200">Return list of company policy status</response>
        [HttpGet]
        [Route("GetPolicyStatusList")]
        [HasPermission(Permissions.ReadCompanyPolicy)]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<PolicyStatusResponseDto>>), 200)]
        public async Task<IActionResult> GetPolicyStatusList()
        {
            var response = await _companyPolicyService.GetPolicyStatus();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get list of policy category type
        /// </summary>
        /// <response code="200">Return list of policy category types</response>
        [HttpGet]
        [Route("GetDocumentCategoryList")]
        [HasPermission(Permissions.ReadCompanyPolicy)]
        [ProducesResponseType(typeof(ApiResponseModel<IEnumerable<CompanyPolicyDocCategoryResponseDto>>), 200)]
        public async Task<IActionResult> GetCompanyDocumentCategoryList()
        {
            var response = await _companyPolicyService.GetDocumentCategory();
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update company policy
        /// </summary>
        /// <param name="companyPolicyRequestDto">**Request Parameters**</param>
        /// <response code="200">Return 200 status for successfully update</response>
        /// <response code="404">Company policy not found</response>
        /// <response code="400">Error in updating policy</response>        
        [HttpPut]
        [Route("UpdateCompanyPolicy")]
        [HasPermission(Permissions.EditCompanyPolicy)]
        [ProducesResponseType(typeof(ApiResponseModel<CompanyPolicyResponseDto>), 200)]
        public async Task<IActionResult> UpdateCompanyPolicy([FromForm] CompanyPolicyRequestDto companyPolicyRequestDto)
        {
            var validationResult = await _validations.ValidateAsync(companyPolicyRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _companyPolicyService.Edit(companyPolicyRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Delete company policy
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Company policy not found</response>     
        [HttpDelete]
        [Route("{id:long}")]
        [HasPermission(Permissions.DeleteCompanyPolicy)]
        public async Task<IActionResult> Delete(long id)
        {
            var response = await _companyPolicyService.Delete(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get company policy list of history data
        /// </summary>
        /// <param name="requestDto">**Request model***</param>
        /// <response code="200">Returns list of company policy history</response>
        [HttpPost]
        [Route("GetCompanyPolicyHistoryList")]
        [HasPermission(Permissions.ViewCompanyPolicy)]
        [ProducesResponseType(typeof(ApiResponseModel<CompanyPolicyHistorySearchResponseDto>), 200)]
        public async Task<IActionResult> GetHistoryListById(SearchRequestDto<CompanyPolicyHistorySearchRequestDto> requestDto)
        {
            var response = await _companyPolicyService.GetCompanyPolicyHistoryListById(requestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Download company policy document
        /// </summary>
        /// <param name="request">**Request model**</param>
        /// <response code="200">Returns the company policy document in byte array</response>
        /// <response code="404">Company policy not found</response>     
        [HttpPost]
        [Route("DownloadPolicyDocument")]
        [HasPermission(Permissions.ViewCompanyPolicy)]
        [ProducesResponseType(typeof(ApiResponseModel<DownloadDocResponseDto>), 200)]
        public async Task<IActionResult> DownloadPolicyDocument(UserCompanyPolicyTrackRequestDto request)
        {
            var response = await _companyPolicyService.DownloadPolicyDocument(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get list of policy track for a user
        /// </summary>
        /// <param name="requestDto">**Request model***</param>
        /// <response code="200">Returns list of track history</response>
        [HttpPost]
        [Route("GetUserCompanyPoliciesTrack")]
        [HasPermission(Permissions.ViewCompanyPolicy)]
        [ProducesResponseType(typeof(ApiResponseModel<UserCompanyPolicyTrackSearchResponseDto>), 200)]
        public async Task<IActionResult> GetUserCompanyPoliciesTrack(SearchRequestDto<UserCompanyPolicyTrackSearchRequestDto> requestDto)
        {
            var response = await _companyPolicyService.GetUserCompanyPolicyTrack(requestDto);
            return StatusCode(response.StatusCode, response);
        }
    }
}
