using FluentValidation;
using HRMS.Models.Models.UserProfile;

namespace HRMS.API.Validations
{
    public class PreviousEmployerRequestValidation : AbstractValidator<PreviousEmployerRequestDto>
    {
        public PreviousEmployerRequestValidation()
        {

            RuleFor(x => x.EmployeeId)
                .NotNull().WithMessage("EmployeeId can not be null.")
                .NotEmpty().WithMessage("EmployeeId can not be empty.");

            RuleFor(x => x.EmployerName)
                .NotNull().WithMessage("Employer Name can not be null.")
                .NotEmpty().WithMessage("Employer Name can not be empty.")
                 .MaximumLength(100).WithMessage("EmployerName should not exceed more than 250 characters");

            RuleFor(x => x.Designation)
            .NotNull().WithMessage("Designation can not be null.")
            .NotEmpty().WithMessage("Designation can not be empty.");

            RuleFor(x => x.StartDate)
                .NotNull().WithMessage("Start Date can not be null.")
                .NotEmpty().WithMessage("Start Date can not be empty.");

            RuleFor(x => x.EndDate)
                .NotNull().WithMessage("End Date can not be null.")
                .NotEmpty().WithMessage("End Date can not be empty.");
        }
    }
}
