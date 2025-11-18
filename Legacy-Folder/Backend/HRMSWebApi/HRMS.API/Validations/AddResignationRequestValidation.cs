using FluentValidation;
using HRMS.Models.Models.UserProfile;

namespace HRMS.API.Validations
{
    public class AddResignationRequestValidation : AbstractValidator<ResignationRequestDto>
    {
        public AddResignationRequestValidation()
        {
            RuleFor(x => x.EmployeeId)
                .NotNull().WithMessage("EmployeeName can not be null.")
                .NotEmpty().WithMessage("EmployeeName can not be empty.");

            RuleFor(x => x.DepartmentId)
               .NotNull().WithMessage("Department can not be null.")
               .NotEmpty().WithMessage("Department can not be empty.");
        }
    }
}
