using FluentValidation;
using HRMS.Models.Models.Employees;


namespace HRMS.API.Validations
{
    public class EmployeeImportValidation : AbstractValidator<ImportEmployeesExcelData>
    {
        public EmployeeImportValidation()
        {
            RuleFor(x => x.EmployeeName)
               .NotNull().WithMessage("Employee name cannot be null.")
               .NotEmpty().WithMessage("Employee name cannot be empty.");

            RuleFor(x => x.Code)
               .NotNull().WithMessage("Code cannot be null.")
               .NotEmpty().WithMessage("Code cannot be empty.");

            RuleFor(x => x.Email)
                .NotNull().WithMessage("Email cannot be null.")
                .NotEmpty().WithMessage("Email cannot be empty.")
                .MaximumLength(100)
                .EmailAddress().WithMessage("Please enter valid email.");

            RuleFor(x => x.Branch)
               .NotEmpty().WithMessage("Branch cannot be empty.")
               .NotNull().WithMessage("Branch can not be null.");

            RuleFor(x => x.DOB)
              .NotEmpty().WithMessage("DOB cannot be empty.")
              .NotNull().WithMessage("DOB cannot be null.");
        }
    }
}

