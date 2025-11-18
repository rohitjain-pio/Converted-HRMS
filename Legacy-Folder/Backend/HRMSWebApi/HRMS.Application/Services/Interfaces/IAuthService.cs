using HRMS.Models.Models.Auth;
using HRMS.Models;

namespace HRMS.Application.Services.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResponseModel<LoginResponseDto>> SSOLogin(SSOLoginRequestDto request);
        Task<ApiResponseModel<LoginResponseDto>> RefreshToken(RefreshTokenRequest request);
        Task<ApiResponseModel<LoginResponseDto>> Login(LoginDto request);
    }
}
