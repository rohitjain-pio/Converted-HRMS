using FluentValidation;
using HRMS.Models.Models.Dashboard;

namespace HRMS.API.Validations
{
    public class DashboardRequestValidation : AbstractValidator<DashboardRequestDto>
    {
        public DashboardRequestValidation()
        {
            RuleFor(x => x.From).Null().DependentRules(() => {
                RuleFor(x => x.Days).GreaterThan(0).WithMessage("Days should be greater then 0");
            });
            RuleFor(x => x.Days).LessThanOrEqualTo(0).DependentRules(() => {
                RuleFor(x => x.From).NotNull().NotEmpty().WithMessage("From date should not be empty or null")
                .LessThan(x => x.To).WithMessage("From date should be less then to date");
                RuleFor(x => x.To).NotNull().NotEmpty().WithMessage("To date should not be empty or null")
                    .GreaterThan(x => x.From).WithMessage("To date should be less then from date");
            });
        }
    }
}
