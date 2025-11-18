using FluentValidation;
using HRMS.Models.Models.UserProfile;

namespace HRMS.API.Validations
{
    public class EmploymentRequestValidation : AbstractValidator<EmploymentRequestDto>
    {
        public EmploymentRequestValidation() 
        {

            RuleFor(x => x.EmployeeId)
                .NotNull().WithMessage("Employee Id can not be null.")
                .NotEmpty().WithMessage("Employee Id can not empty.");

            RuleFor(x => x.Email)
                .NotNull().WithMessage("Email can not be null.")
                .NotEmpty().WithMessage("Email can not empty.")
                .MaximumLength(100)
                .EmailAddress().WithMessage("Please enter valid email.");

            RuleFor(x => x.DesignationId)
               .NotEmpty().WithMessage("Designation can not be empty.")
               .NotNull().WithMessage("Designation can not be null.");

            RuleFor(x => x.BranchId)
               .NotEmpty().WithMessage("Branch can not be empty.")
               .NotNull().WithMessage("Branch can not be null.");

            RuleFor(x => x.TeamId)
              .NotEmpty().WithMessage("Team can not be empty.")
              .NotNull().WithMessage("Team can not be null.");

            RuleFor(x => x.RoleId)
             .NotEmpty().WithMessage("Role can not be empty.")
             .NotNull().WithMessage("Role can not be null.");

            RuleFor(x => x.DepartmentId)
            .NotEmpty().WithMessage("Department can not be empty.")
            .NotNull().WithMessage("Department can not be null.");

        }

    }
}
