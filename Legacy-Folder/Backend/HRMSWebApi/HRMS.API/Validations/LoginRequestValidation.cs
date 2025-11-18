using FluentValidation;
using HRMS.Models.Models.Auth;

namespace HRMS.API.Validations
{
    public class LoginRequestValidation : AbstractValidator<SSOLoginRequestDto>
    {
        public LoginRequestValidation()
        {
            RuleFor(x => x.MsAuthToken).NotNull().NotEmpty().WithMessage("Ms AuthToken is required");
        }
    }
}
