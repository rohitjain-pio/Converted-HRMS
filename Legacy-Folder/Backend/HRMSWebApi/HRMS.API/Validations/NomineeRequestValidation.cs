using FluentValidation;
using HRMS.Domain.Enums;
using HRMS.Models.Models.UserProfile;
using Newtonsoft.Json.Linq;

namespace HRMS.API.Validations
{
    public class NomineeRequestValidation : AbstractValidator<NomineeRequestDto>
    {   public NomineeRequestValidation()
        {
            RuleFor(x => x.NomineeName)
                .NotEmpty().NotNull()                
                .WithMessage("NomineeName is required.")
                .MaximumLength(150)
                .WithMessage("Nominee name must not exceeded 150 characters.")
                .Matches("^[a-zA-Z0-9 _.-]*$").WithMessage("NomineeName can only contain alphanumeric characters, underscores, spaces, dashes, and periods");

            RuleFor(x => x.EmployeeId).NotNull().NotEmpty().
                WithMessage("EmployeeId is required");

            RuleFor(x => x.DOB)
                .NotEmpty().NotNull()               
                .WithMessage("DOB is required.");

            RuleFor(x => x.Age)
               .NotEmpty().NotNull()              
               .WithMessage("Age is required.")
               .InclusiveBetween(0, 120)
               .WithMessage("Age must be a non-negative number between 0 and 120.");

            RuleFor(x => x.CareOf)
               .Empty()
               .When(x => x.Age > 18)
               .WithMessage("CareOf must be empty if Age is greater than 18.");

            RuleFor(x => x.CareOf)
                 .MaximumLength(150)
                .NotEmpty()
                .When(x => x.Age < 18)
                .WithMessage("CareOf field is required when age is less than 18 years.")
                .Matches("^[a-zA-Z0-9 _.-]*$").WithMessage("CareOf can only contain alphanumeric characters, underscores, spaces, dashes, and periods");

            RuleFor(x => x.Relationship)
               .GreaterThan(0)
               .NotNull().NotNull()
               .WithMessage("RelationShipId is required and must be a positive value.")
               .Must(value => Enum.IsDefined(typeof(Relationship), value))
               .WithMessage("Invalid relationShipId type");

            RuleFor(x => x.Others)
               .Empty()
               .When(x => x.Relationship != (int)Relationship.Others)
               .WithMessage("The 'Others' field must be empty unless 'Relationship' is set to 'Others'.");

            RuleFor(x => x.Others)
                .MaximumLength(150)              
                .NotEmpty()
                .When(x => x.Relationship == (int)Relationship.Others)
                .WithMessage("Others field is required when 'others' relationship is selected.")
                 .Matches("^[a-zA-Z0-9 _.-]*$").WithMessage("Others can only contain alphanumeric characters, underscores, spaces, dashes, and periods");

            RuleFor(x => x.Percentage)
                .NotEmpty()               
                .WithMessage("Percentage is required.")
                .InclusiveBetween(0, 100)
                .WithMessage("Percentage must be a numeric value between 0 and 100.");

        }
    }
}
