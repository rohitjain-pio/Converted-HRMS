using HRMS.API.Athorization;
using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace HRMS.API.Controllers
{
    [Route("api/UserProfile")]
    [ApiController]
    [HasPermission(Permissions.ReadCertificate)]
    public class CertificateController : ControllerBase
    {
        private readonly UploadEmployeeCertificateValidation _uploadEmployeeCertificateValidation;
        private readonly ICertificateService _certificateService;

        public CertificateController(UploadEmployeeCertificateValidation UploadEmployeeCertificateValidation, ICertificateService certificateService)
        {
            this._uploadEmployeeCertificateValidation = UploadEmployeeCertificateValidation;
            this._certificateService = certificateService;
        }

        /// <summary>
        /// Save employee certificate
        /// </summary>
        /// <param name="uploadCertificateRequestDto"></param>
        /// <response code="200">Employee certificate is saved successfully</response>
        /// <response code="400">Error is saving Employee certificate</response>
        [HttpPost]
        [Route("UploadEmployeeCertificate")]
        [HasPermission(Permissions.CreateCertificate)]
        public async Task<IActionResult> UploadEmployeeCertificate([FromForm] UserCertificateRequestDto uploadCertificateRequestDto)
        {
            var validationResult = await _uploadEmployeeCertificateValidation.ValidateAsync(uploadCertificateRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _certificateService.UploadEmployeeCertificate(uploadCertificateRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Update employee certificate
        /// </summary>
        /// <param name="uploadCertificateRequestDto"></param>
        /// <response code="200">Employee certificate is updated successfully</response>
        /// <response code="400">Error is updating Employee certificate</response>
        [HttpPost]
        [Route("UpdateUploadEmployeeCertificate")]
        [HasPermission(Permissions.EditCertificate)]
        public async Task<IActionResult> UpdateUploadEmployeeCertificate([FromForm] UserCertificateRequestDto uploadCertificateRequestDto)
        {
            var validationResult = await _uploadEmployeeCertificateValidation.ValidateAsync(uploadCertificateRequestDto);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _certificateService.UpdateUploadEmployeeCertificate(uploadCertificateRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Delete employee certificate
        /// </summary>
        /// <param name="employeeArchiveRequestDto"></param>
        /// <response code="200">Return 200 status code for successfully delete</response>
        /// <response code="404">Employee certificatey not found</response>   
        [HttpDelete]
        [Route("ArchiveUnarchiveUserCertificates")]
        [HasPermission(Permissions.DeleteCertificate)]
        public async Task<IActionResult> ArchiveUnarchiveUserCertificate(EmployeeArchiveRequestDto employeeArchiveRequestDto)
        {
            var response = await _certificateService.ArchiveUnarchiveUserCertificate(employeeArchiveRequestDto);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get list of employee certificates
        /// </summary>
        /// <param name="request">**Request parameter**</param>
        /// <response code="200">Return list of employee certificates</response>
        [HttpPost]
        [Route("GetEmployeeCerificateList")]
        [ProducesResponseType(typeof(ApiResponseModel<UserCertificateSearchResponseDto>), 200)]
        [HasPermission(Permissions.ReadCertificate)]
        public async Task<IActionResult> GetEmployeeCerificateList(SearchRequestDto<UserCertificateSearchRequestDto> request)
        {
            var response = await _certificateService.GetEmployeeCerificateList(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get user certificate by Id
        /// </summary>
        /// <param name="id">**long**</param>
        /// <response code="200">Returns user uertificate</response>
        /// <response code="404">User certificate not found</response>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponseModel<UserCertificateResponseDto>), 200)]
        [Route("GetUserCertificateById/{id:long}")]
        [HasPermission(Permissions.ViewCertificate)]
        public async Task<IActionResult> GetUserCertificateById(long id)
        {
            var response = await _certificateService.GetUserCertificateById(id);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Download certificate document
        /// </summary>
        /// <param name="fileName"></param>
        /// <response code="200">Return certificate document</response>
        /// <response code="404">Certificate document not found</response>
        [HttpGet]
        [Route("DownloadCertificateDocument")]
        [HasPermission(Permissions.ViewCertificate)]
        public async Task<IActionResult> DownloadCertificateDocument(string fileName)
        {
            var response = await _certificateService.DownloadCertificateDocument(BlobContainerConstants.UserDocumentContainer, fileName);
            return StatusCode(response.StatusCode, response);
        }
    }
}