using FluentValidation;
using HRMS.Models.Models.Event;
using HRMS.Models.Models.NotificationTemplate;

namespace HRMS.API.Validations
{
    public class NotificationTemplateRequestValidation : AbstractValidator<EmailTemplateUpdateRequestDto>
    {
        public NotificationTemplateRequestValidation()
        {
            RuleFor(x => x.TemplateName).NotEmpty().NotNull().
               WithMessage("Template Name is required")
               .Matches("^[a-zA-Z0-9 _.-]*$").WithMessage("This allow only speical characters like(_ . -) and alphanumeric values only");

            // RuleFor(x => x.Description).NotEmpty().NotNull()
            //     .WithMessage("Description is required")
            //     .MaximumLength(250)
            //     .WithMessage("Description must not exceeded 250 characters.");

            RuleFor(x => x.Content).NotNull().NotEmpty().
                WithMessage("Content is required");

            RuleFor(x => x.Subject).NotNull().NotEmpty().
                WithMessage("Email Subject is required")
                .MaximumLength(200)
                .WithMessage("Subject must not exceeded 200 characters."); ;
        }
    }
}
