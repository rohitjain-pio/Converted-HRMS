using HRMS.Domain.Contants;
using Microsoft.AspNetCore.Authorization;

namespace HRMS.API.Athorization
{
    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirment>
    {
        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirment requirement)
        {
            if(context.User.Claims.Any(c=>c.Type== "IsApiKeyAuthenticated" && c.Value=="true"))
            {
                context.Succeed(requirement);
                return Task.CompletedTask;
            }
          var permissions = context.User.Claims.Where(c=>c.Type == ApplicationConstants.PermissionClaimName)
                                               .Select(c=>c.Value);
            if (permissions.Contains(requirement.Permission))
                context.Succeed(requirement);
            
              return Task.CompletedTask;            

        }
    }
}
