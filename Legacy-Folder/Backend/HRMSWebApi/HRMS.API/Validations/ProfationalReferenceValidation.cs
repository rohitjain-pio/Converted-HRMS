using FluentValidation;
using HRMS.Models.Models.UserProfile;
using System.Text.RegularExpressions;

namespace HRMS.API.Validations
{
    public class ProfationalReferenceValidation : AbstractValidator< ProfessionalReferenceRequestDto>
    { 
        public ProfationalReferenceValidation( ) 
        { 

            RuleFor(x => x.FullName).NotEmpty().NotNull().
            WithMessage("Name is required").
            MaximumLength(250).WithMessage("Length should be less than 250 characters only").
            Matches("^[a-zA-Z0-9 _.-]*$").WithMessage("Name must contains only alphabets and spaces.");

            RuleFor(x => x.Designation).NotEmpty().NotNull().
            WithMessage("Designation is required").
            MaximumLength(250).WithMessage("Length should be less than 250 characters only").
            Matches("^(?!\\d+$).+$").WithMessage("This field cannot consist entirely of only numbers");

            RuleFor(x => x.ContactNumber).NotNull().NotEmpty().
            WithMessage("contact number is required").
            Must(ValidateForPhone).WithMessage("Please enter correct phone number only")
            .MaximumLength(16).
            Must(ValidateForPhone).WithMessage("Contact number length must be between 10 to 12 digits");

            RuleFor(x => x.Email).NotNull().NotEmpty().
            WithMessage("Email is required").EmailAddress().
            MaximumLength(250).WithMessage("Length should be less than 250 characters only").
            WithMessage("Please enter correct email only");
             
        }
        private bool ValidateForPhone(string arg)
        {
            if (Regex.Match(arg, "^(?:\\+1 [\\d-]{10,12}|\\+91 [\\d-]{10,12})$").Success)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    }
}
