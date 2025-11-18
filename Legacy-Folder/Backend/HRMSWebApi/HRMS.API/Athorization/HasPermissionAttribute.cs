using Microsoft.AspNetCore.Authorization;

namespace HRMS.API.Athorization
{
    public class HasPermissionAttribute : AuthorizeAttribute
    {
        public HasPermissionAttribute(string permission) : base(policy: permission)
        {
           
        }
    }   
}
