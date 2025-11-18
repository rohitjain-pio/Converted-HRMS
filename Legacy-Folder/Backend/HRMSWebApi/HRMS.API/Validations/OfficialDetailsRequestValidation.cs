using FluentValidation;
using HRMS.Models.Models.OfficialDetails;
using System.Text.RegularExpressions;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace HRMS.API.Validations
{
    public class OfficialDetailsRequestValidation : AbstractValidator<OfficialDetailsRequestDto>
    {
        public OfficialDetailsRequestValidation()
        {

            RuleFor(x => x.Id)
                .NotNull().WithMessage("Employee Id can not be null.")
                .NotEmpty().WithMessage("Employee Id can not empty.");

            RuleFor(x => x.PANNumber)
                .NotNull().WithMessage("PANNumber can not be null.")
                .NotEmpty().WithMessage("PANNumber can not empty.")
                .MaximumLength(100).WithMessage("Please enter valid PANNumber.");

            RuleFor(x => x.AdharNumber)
               .NotEmpty().WithMessage("AdharNo  can not be empty.")
               .NotNull().WithMessage("AdharNo  can not be null.");

              RuleFor(x => x.BankDetails.AccountNo)
               .NotEmpty().WithMessage("Bank Account Number cannot be empty.")
               .NotNull().WithMessage("Bank Account Number can not be null.")
               .Must(x => x.Length >= 7 && x.Length <= 18)
               .WithMessage("Bank Account Number must be numeric and  between 7 to 18 characters.");


            RuleFor(x => x.BankDetails.IFSCCode)
                .NotEmpty().WithMessage("IFSC Code is required.")
                .Matches("^[a-zA-Z0-9]{8,15}$").WithMessage("IFSC Code must be alphanumeric and between 8 to 15 characters.");

            RuleFor(x => x.UANNo).MaximumLength(250)
           .WithMessage("UANNo should not exceed more than 250 characters")
            .Matches("^[0-9]{8,15}$").WithMessage("UAN Number must be numeric and between 8 to 15 characters.");
        }
    }
}

