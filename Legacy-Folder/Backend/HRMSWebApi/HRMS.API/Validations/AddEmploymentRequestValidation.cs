using FluentValidation;
using HRMS.Models.Models.UserProfile;

namespace HRMS.API.Validations
{
    public class AddEmploymentRequestValidation : AbstractValidator<AddEmploymentDetailRequestDto>
    {
        public AddEmploymentRequestValidation() 
        {
            RuleFor(x => x.FirstName)
               .NotNull().WithMessage("First name can not be null.")
               .NotEmpty().WithMessage("First name can not empty.");

            RuleFor(x => x.LastName)
               .NotNull().WithMessage("Last name can not be null.")
               .NotEmpty().WithMessage("Last name can not empty.");
             
            RuleFor(x => x.Email)
                .NotNull().WithMessage("Email can not be null.")
                .NotEmpty().WithMessage("Email can not empty.")
                .MaximumLength(100)
                .EmailAddress().WithMessage("Please enter valid email.");

            RuleFor(x => x.JoiningDate)
               .NotEmpty().WithMessage("Joining Date can not be empty.")
               .NotNull().WithMessage("Joining Date can not be null.");

            RuleFor(x => x.BranchId)
               .NotEmpty().WithMessage("Branch can not be empty.")
               .NotNull().WithMessage("Branch can not be null.");
             

        }

    }
}
