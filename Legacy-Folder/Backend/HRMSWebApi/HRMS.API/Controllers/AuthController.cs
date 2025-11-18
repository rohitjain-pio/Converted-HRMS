using HRMS.API.Validations;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Domain.Utility;
using HRMS.Models;
using HRMS.Models.Models.Auth;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace HRMS.API.Controllers
{
    [Route("api/Auth")]
    [ApiController]
    public class AuthController(IAuthService authService, LoginRequestValidation validations, RefreshTokenRequestValidation refreshTokenValidation, LoginValidation loginValidations, IConfiguration configuration) : ControllerBase
    {
        private readonly IAuthService _authService = authService;
        private readonly LoginRequestValidation _validations = validations;
        private readonly RefreshTokenRequestValidation _refreshTokenValidation = refreshTokenValidation;
        private readonly LoginValidation _loginValidations = loginValidations;
      
        /// <summary>
        /// SSO Login 
        /// </summary>
        /// <param name="request">**Request Parameters**</param>
        /// <response code="200">Return 200 status for successfully Log in</response>
        /// <response code="400">Error in SSO Login</response>  
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponseModel<LoginResponseDto>), 200)]
        public async Task<IActionResult> SSOLogin(SSOLoginRequestDto request)
        {
            var validationResult = await _validations.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _authService.SSOLogin(request);           
            return StatusCode(response.StatusCode, response);
        }
        /// <summary>
        ///  Login 
        /// </summary>
        /// <param name="request">**Request Parameters**</param>
        /// <response code="200">Return 200 status for successfully Log in</response>
        /// <response code="400">Error in Login</response>  
        [HttpPost]
        [Route("Login")]
        [ProducesResponseType(typeof(ApiResponseModel<LoginResponseDto>), 200)]
        public async Task<IActionResult> Login(LoginDto request)
        {
            var validationResult = await _loginValidations.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _authService.Login(request);
            return StatusCode(response.StatusCode, response);
        }

        /// <summary>
        /// Get Refresh Token
        /// </summary>
        /// <param name="request">**Request Parameters**</param>
        /// <response code="200">Return 200 refresh token generated successfully</response>
        /// <response code="400">Error in Get Refresh token</response>  
        /// <response code="403">Invalid/Expired refresh token</response>  
        [HttpPost]
        [Route("RefreshToken")]
        [ProducesResponseType(typeof(ApiResponseModel<LoginResponseDto>), 200)]
        public async Task<IActionResult> RefreshToken(RefreshTokenRequest request)
        {
            var validationResult = await _refreshTokenValidation.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors.Select(x => x.ErrorMessage).ToList();
                return BadRequest(new ApiResponseModel<object>
                (
                    (int)HttpStatusCode.BadRequest, ErrorMessage.ModelStateInValid, errors
                ));
            }
            var response = await _authService.RefreshToken(request);
            return StatusCode(response.StatusCode, response);
        }
        
        [HttpGet]
        [Route("CheckHealth")] 
        public async Task<IActionResult> CheckHealth()
        {
          string? _buildVersion = configuration["BuildVersions:Version"];
          object obj = "API Version "+ _buildVersion;
          return  StatusCode((int)HttpStatusCode.OK, obj);
        }

    }
}
