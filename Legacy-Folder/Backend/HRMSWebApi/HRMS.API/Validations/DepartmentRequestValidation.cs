using FluentValidation;
using HRMS.Models.Models.UserProfile;

namespace HRMS.API.Validations
{
    public class DepartmentRequestValidation : AbstractValidator<DepartmentRequestDto>
    {
            public DepartmentRequestValidation()
            {
            RuleFor(x => x.Department)
               .NotNull().WithMessage("Department Name can not be null.");
            }
        }
    }

