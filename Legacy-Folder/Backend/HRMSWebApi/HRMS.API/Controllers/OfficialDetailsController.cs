using HRMS.Domain.Contants;
using HRMS.Models.Models.UserProfile;
using HRMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.API.Athorization;
using HRMS.Models.Models.OfficialDetails;
using HRMS.Application.Services;

namespace HRMS.API.Controllers
{
    [Route("api/OfficialDetails")]
    [ApiController]
    [HasPermission(Permissions.ReadOfficialDetails)]
    public class OfficialDetailsController : ControllerBase
    {
        private readonly IUserProfileService _userProfileService;
        private readonly OfficialDetailsRequestValidation _officialDetailsRequestValidation;

        public OfficialDetailsController(IUserProfileService userProfileService, OfficialDetailsRequestValidation officialDetailsRequestValidation)
        {
            _userProfileService = userProfileService;
            _officialDetailsRequestValidation = officialDetailsRequestValidation;
        }

        /// <summary>
        /// Update official detail
        /// </summary>
        /// <response code="200">Update all official detail </response>
        /// <param name="request">**Request parameter**</param>
        [HttpPost]
        [Route("UpdateOfficialDetails")]
        [HasPermission(Permissions.EditOfficialDetails)]
        public async Task<IActionResult> UpdateOfficialDetails(OfficialDetailsRequestDto request)
        {
            var validationResult = await _officialDetailsRequestValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _userProfileService.UpdateOfficialDetails(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get official details 
        /// </summary>
        /// <response code="200">Get all official detail by id</response>
        /// <param name="id">**Employee Id**</param>
        [HttpGet]
        [Route("{id:long}")]
        [HasPermission(Permissions.ViewOfficialDetails)]
        public async Task<IActionResult> GetOfficialDetailsById(long id)
        {
            var response = await _userProfileService.GetOfficialDetailsById(id);
            return StatusCode(response.StatusCode, response);
        }

     
    }
}
