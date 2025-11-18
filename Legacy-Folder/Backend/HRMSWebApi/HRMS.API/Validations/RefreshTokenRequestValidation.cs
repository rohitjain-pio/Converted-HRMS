using FluentValidation;
using HRMS.Models.Models.Auth;
using HRMS.Models.Models.Event;

namespace HRMS.API.Validations
{
    public class RefreshTokenRequestValidation : AbstractValidator<RefreshTokenRequest>
    {
        public RefreshTokenRequestValidation()
        {
            RuleFor(x => x.AccessToken).NotEmpty().NotNull()
               .WithMessage("AccessToken is required");

            RuleFor(x => x.RefreshToken).NotEmpty().NotNull()
               .WithMessage("RefreshToken is required");
        }
    }
}
