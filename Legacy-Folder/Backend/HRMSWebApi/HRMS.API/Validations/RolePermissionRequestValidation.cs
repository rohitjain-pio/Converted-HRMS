using FluentValidation;
using HRMS.Models.Models.CompanyPolicy;
using HRMS.Models.Models.RolePermission;

namespace HRMS.API.Validations
{
    public class RolePermissionRequestValidation : AbstractValidator<RolePermissionRequestDto>
    {
        public RolePermissionRequestValidation()
        {
            RuleFor(x => x.RoleId).NotNull().GreaterThan(-1).WithMessage("Role Id is required");
            RuleFor(x => x.RoleName).NotNull().NotEmpty().When(x => x.IsRoleNameUpdate).WithMessage("Role Name is required")
                .Matches(@"^(?!'+$)[a-zA-Z']+(?:\s+[a-zA-Z']+)*$").WithMessage("Role Name must be alphabets");
            RuleFor(x => x.PermissionList).NotEmpty().When(x => x.IsRolePermissionUpdate).WithMessage("Permission list is required");
        }
    }
}
