using HRMS.Application.Clients;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Configurations;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models.Auth;
using HRMS.Models.Models.Role;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace HRMS.Application.Services
{
    public class AuthService(IUnitOfWork unitOfWork, IOptions<JwtOptions> jwtOptions, GraphApiClient graphApiClient, IOptions<List<UserCredentials>> userCredentials) : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly GraphApiClient graphApiClient = graphApiClient;
        private readonly JwtOptions _jwtOptions = jwtOptions.Value;
        private readonly List<UserCredentials> _userCredentials = userCredentials.Value;
       

        public async Task<ApiResponseModel<LoginResponseDto>> SSOLogin(SSOLoginRequestDto request)
        {
            LoginResponseDto responseDto = new();
            string errorMsg = ErrorMessage.UserNotExist;
            MsAuthValidateResponseModel authTokenResponse = await graphApiClient.ValidateMicroSoftOAuthToken(request.MsAuthToken);
            if (authTokenResponse != null && !string.IsNullOrWhiteSpace(authTokenResponse.mail))
            {
                responseDto.UserEmail = authTokenResponse.mail;
                responseDto.UserName = authTokenResponse.userPrincipalName ?? authTokenResponse.mail;
                return await GenerateUserTokens(responseDto);
            }
            return new ApiResponseModel<LoginResponseDto>((int)HttpStatusCode.BadRequest, errorMsg, null);
        }

        public async Task<ApiResponseModel<LoginResponseDto>> Login(LoginDto request)
        {
            LoginResponseDto responseDto = new();
            string errorMsg = ErrorMessage.UserNotExist;
            string encryptedPassword = AESPasswordEncryption.EncryptPassword(request.Password);
            if (_userCredentials.Any(u => u.UserEmail == request.Email && u.Password == encryptedPassword))
            {
                responseDto.UserEmail = request.Email;
                responseDto.UserName = request.Email;
                return await GenerateUserTokens(responseDto);
            }
            return new ApiResponseModel<LoginResponseDto>((int)HttpStatusCode.BadRequest, errorMsg, null);
        }
        private static string GenerateJwtToken(JwtOptions _jwt, LoginResponseDto user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            SymmetricSecurityKey _signingKey = new(Encoding.ASCII.GetBytes(_jwt.Key));

            var claims = new List<Claim> {
                    new Claim(ClaimTypes.Name, user.UserName ?? string.Empty),
                    new Claim(ClaimTypes.Sid, user.UserId.ToString() ?? string.Empty),
                    new Claim(ClaimTypes.Email, user.UserEmail  ?? string.Empty),
                    new Claim(ClaimTypes.Role, user.RoleId ?? string.Empty)};

            if (user.ModulePermissions.Modules.Any())
            {
                foreach (var permissions in user.ModulePermissions.Modules.Select(x => x.Permissions))
                    foreach (var permission in permissions.Where(x => x.IsActive))
                        claims.Add(new Claim(ApplicationConstants.PermissionClaimName, permission.PermissionValue));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                IssuedAt = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddHours(_jwt.ValidHours),
                SigningCredentials = new SigningCredentials(_signingKey, SecurityAlgorithms.HmacSha256Signature),

                Issuer = _jwt.Issuer,
                Audience = _jwt.Audience,
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
        private RefreshToken GenerateRefreshToken()
        {
            return new RefreshToken
            {
                TokenValue = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
                Expires = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpiryDays)
            };
        }
        private async Task<ApiResponseModel<LoginResponseDto>> GenerateUserTokens(LoginResponseDto responseDto)
        {
            string errorMsg = string.Empty;
            var userResponse = await _unitOfWork.AuthRepository.GetUserByEmailId( responseDto.UserEmail, responseDto.UserName);
            if (userResponse != null && userResponse.UserId > 0)
            {
                userResponse.UserName = responseDto.UserName ?? responseDto.UserEmail;
                 var RoleList = new List<int>();
                  RoleList.Add(int.Parse(userResponse.RoleId));
                if (userResponse.IsReportingManager)
                {
                     RoleList.Add((int)Roles.TeamLead);
                }
                //Module Permission
                UserRolePermissionResponseDto model = new();
                var moduleListPermissionDto = await _unitOfWork.AuthRepository.GetModulePermissionByRole(RoleList);
                if (moduleListPermissionDto != null && moduleListPermissionDto.Any())
                {
                    
                   
                    var moduleGroup = moduleListPermissionDto.GroupBy(m => m.ModuleId).ToList();
                    foreach (var moduleGroupDto in moduleGroup)
                    {
                        ModuleDto moduleModel = new ModuleDto();
                        moduleModel.ModuleId = moduleGroupDto.AsEnumerable().First().ModuleId;
                        moduleModel.ModuleName = moduleGroupDto.AsEnumerable().First().ModuleName;
                        foreach (var item in moduleGroupDto)
                        {
                            PermissionDto permissionModel = new PermissionDto();
                            permissionModel.PermissionId = item.PermissionId;
                            permissionModel.PermissionName = item.PermissionName;
                            permissionModel.IsActive = item.IsActive;
                            permissionModel.PermissionValue = item.PermissionValue;
                            moduleModel.Permissions.Add(permissionModel);
                        }
                        moduleModel.IsActive = moduleModel.Permissions.Exists(m => m.IsActive);
                        model.Modules.Add(moduleModel);
                    }
                    responseDto.ModulePermissions = model;
                }
                userResponse.ModulePermissions = model;
                userResponse.AuthToken = GenerateJwtToken(_jwtOptions, userResponse);
                responseDto = userResponse;
                responseDto.UserName = userResponse.UserName;
                responseDto.UserId = userResponse.UserId;
                responseDto.RoleId = userResponse.RoleId;
                responseDto.RoleName = userResponse.RoleName;
                responseDto.FirstName = userResponse.FirstName;
                responseDto.LastName = userResponse.LastName;

                

                //Menu
                var menus = await _unitOfWork.AuthRepository.GetMenuByRole(RoleList);
                if (menus != null && menus.Any())
                    responseDto.Menus = menus.ToList();
                var refreshToken = GenerateRefreshToken();
                responseDto.RefreshToken = refreshToken.TokenValue;
                refreshToken.UserId = userResponse.UserId;
                await _unitOfWork.AuthRepository.UpdateRefreshToken(refreshToken);

                return new ApiResponseModel<LoginResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, responseDto);
            }
            else
            {
                errorMsg = ErrorMessage.UserNotExist;
            }
            return new ApiResponseModel<LoginResponseDto>((int)HttpStatusCode.BadRequest, errorMsg, null);
        }
        public async Task<ApiResponseModel<LoginResponseDto>> RefreshToken(RefreshTokenRequest request)
        {
            var principal = GetPrincipalFromExpiredToken(request.AccessToken);
            if (principal == null)
                return new ApiResponseModel<LoginResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidAccessToken, null);

            string username = principal.Identity.Name;

            var refreshToken = await _unitOfWork.AuthRepository.GetRefreshTokenByEmailId(username);

            if (refreshToken is null || !refreshToken.TokenValue.Equals(request.RefreshToken))
                return new ApiResponseModel<LoginResponseDto>((int)HttpStatusCode.Forbidden, ErrorMessage.InvalidRefreshToken, null);
            if (refreshToken.Expires < DateTime.UtcNow)
                return new ApiResponseModel<LoginResponseDto>((int)HttpStatusCode.Forbidden, ErrorMessage.RefreshTokenExpired, null);

            LoginResponseDto responseDto = new();
            responseDto.UserEmail = username;
            return await GenerateUserTokens(responseDto);
        }
        private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
        {
            SymmetricSecurityKey _signingKey = new(Encoding.ASCII.GetBytes(_jwtOptions.Key));
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _signingKey,
                ValidateLifetime = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken _);

            return principal;
        }
    }
}
