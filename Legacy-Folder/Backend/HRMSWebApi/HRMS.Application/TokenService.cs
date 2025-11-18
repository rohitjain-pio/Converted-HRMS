using HRMS.Domain.Enums;
using Microsoft.AspNetCore.Http;
namespace HRMS.Application
{
    public class TokenService(IHttpContextAccessor httpContextAccessor)
    {
        private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
        public string? UserEmailId
        {
            get
            {
                var userEmail = _httpContextAccessor.HttpContext!.User.Claims.Where(a => a.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress").Select(a => a.Value).FirstOrDefault();
                return (!string.IsNullOrEmpty(userEmail)) ? userEmail : "admin";
            }
        }
        public Roles RoleId
        {
            get
            {
                string? roleId = _httpContextAccessor.HttpContext!.User.Claims.Where(a => a.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role").Select(a => a.Value).FirstOrDefault();

                if (!string.IsNullOrEmpty(roleId) && int.TryParse(roleId, out int roleInt))
                {
                    return (Roles)roleInt;
                } 
                return Roles.Employee;
            }
        }
        public int? SessionUserId
        {
            get
            {
                var sessionUserId = _httpContextAccessor.HttpContext!.User.Claims.Where(a => a.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/sid").Select(a => a.Value).FirstOrDefault();
                return (!string.IsNullOrEmpty(sessionUserId)) ? Convert.ToInt32(sessionUserId) : 0;
            }
        }
    }
}
 