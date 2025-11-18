using HRMS.Domain.Entities;
using Microsoft.AspNetCore.Authorization;

namespace HRMS.API.Athorization
{
    public class PermissionRequirment : IAuthorizationRequirement
    {
        public PermissionRequirment(string permission)
        {
            Permission = permission;
        }
        public string Permission { get; }
    }
}

