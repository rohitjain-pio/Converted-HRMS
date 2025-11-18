using HRMS.Models.Models.UserProfile;
using HRMS.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.Application.Services;

namespace HRMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class ExternalAPIController : ControllerBase
    {
        private readonly IEmploymentDetailService _employmentDetailService;

        public ExternalAPIController(IEmploymentDetailService employmentDetailService)
        {
            _employmentDetailService = employmentDetailService;
        }

        /// <summary>
        /// employment detail by email
        /// </summary>
        /// <response code="200">Return employment detail by email</response>
     
        [HttpGet]
        [Route("GetEmploymentDetail")]
        [ProducesResponseType(typeof(ApiResponseModel<EmploymentDetailsForDwnTwn>), 200)]
        public async Task<IActionResult> GetEmploymentDetail(string email)
        {
            var response = await _employmentDetailService.GetEmplyementDetails(email);
            return StatusCode(response.StatusCode, response);

        }
    }
}
