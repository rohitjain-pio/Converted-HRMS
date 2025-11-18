using FluentValidation;
using HRMS.Domain.Contants;
using HRMS.Models.Models.Auth;
using System.Text.RegularExpressions;

namespace HRMS.API.Validations
{

    public class LoginValidation : AbstractValidator<LoginDto>
    {
        public LoginValidation()
        {
            RuleFor(x => x.Email).NotNull().NotEmpty().WithMessage("Email is required");
            RuleFor(x => x.Password).NotNull().NotEmpty().WithMessage("Password is required");
        }
    }
}


