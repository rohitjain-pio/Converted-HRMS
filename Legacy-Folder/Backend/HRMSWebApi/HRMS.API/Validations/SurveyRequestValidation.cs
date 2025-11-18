using FluentValidation;
using HRMS.Models.Models.NotificationTemplate;
using HRMS.Models.Models.Survey;

namespace HRMS.API.Validations
{
    public class SurveyRequestValidation : AbstractValidator<SurveyRequestDto>
    {
        public SurveyRequestValidation()
        {
            RuleFor(x => x.Title).NotEmpty().NotNull().
               WithMessage("Title Name is required")
               .MaximumLength(100)
               .WithMessage("Title name must not exceeded 100 characters.");

            RuleFor(x => x.Description).NotEmpty().NotNull()
                .WithMessage("Description is required")
                .MaximumLength(500)
                .WithMessage("Description must not exceeded 500 characters.");

            RuleFor(x => x.SurveyJson).NotEmpty().NotNull().
                WithMessage("SurveyJson is required")
                .MaximumLength(500)
                .WithMessage("SurveyJson must not exceeded 500 characters.");

            RuleFor(x => x.FormIoReferenceId)
               .MaximumLength(100)
               .WithMessage("FormIoReferenceId must not exceeded 100 characters.");


        }
    }
}
