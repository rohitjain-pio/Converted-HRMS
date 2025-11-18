using FluentValidation;
using HRMS.Models.Models.UserProfile;

namespace HRMS.API.Validations
{
    public class TeamRequestValidation : AbstractValidator<TeamRequestDto>
    {
        public TeamRequestValidation()
        {
            RuleFor(x => x.TeamName).NotEmpty()
               .NotNull().WithMessage("Team Name required");
        }
    }
}

