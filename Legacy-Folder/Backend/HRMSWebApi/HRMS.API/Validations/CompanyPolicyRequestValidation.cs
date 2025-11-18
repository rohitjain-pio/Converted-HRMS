using FluentValidation;
using HRMS.Models.Models.CompanyPolicy;
using System.Text.RegularExpressions;

namespace HRMS.API.Validations
{
    public class CompanyPolicyRequestValidation : AbstractValidator<CompanyPolicyRequestDto>
    {
        public CompanyPolicyRequestValidation()
        {
            RuleFor(x => x.Name).NotEmpty().NotNull().
                 WithMessage("Company Policy Name is required")
                 .Matches("^(?!\\d+$).+$").WithMessage("This field cannot consist entirely of only numbers").
                 MaximumLength(250).WithMessage("Name should not exceed more than 250 characters");

            RuleFor(x => x.DocumentCategoryId).NotEmpty().NotNull()
                .WithMessage("Document category is required"); 
             
            RuleFor(x => x.StatusId).NotNull().NotEmpty().
                WithMessage("Status is required");

            RuleFor(x => x.Description).MaximumLength(250)
               .WithMessage("Description should not exceed more than 250 characters");

        }
    }

}
