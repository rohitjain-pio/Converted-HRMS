using FluentValidation;
using HRMS.Models.Models.CompanyPolicy;
using HRMS.Models.Models.EmployeeGroup;
using System.Text.RegularExpressions;

namespace HRMS.API.Validations
{
    public class EmployeeGroupRequestValidation : AbstractValidator<EmployeeGroupRequestDto>
    {
        public EmployeeGroupRequestValidation()
        {
            RuleFor(x => x.GroupName).NotEmpty().NotNull().
                 WithMessage("Group Name is required").MaximumLength(100)
                 .Matches( "^[a-zA-Z0-9 _.-]*$").WithMessage("Please enter alphanumeric values only.");

            RuleFor(x => x.Status).NotEmpty().NotNull()
                .WithMessage("Status is required");

            RuleFor(x => x.EmployeeIds).NotEmpty().NotNull().WithMessage("EmployeeIds cannot be empty.")
                .Must(e => e.All(id => id > 0)).WithMessage("All EmployeeIds must be non-zero.")
                .Must(e => e.Distinct().Count() == e.Count).WithMessage("The EmployeeIds list must not contain duplicate values.");
         
        }  
    }
}
