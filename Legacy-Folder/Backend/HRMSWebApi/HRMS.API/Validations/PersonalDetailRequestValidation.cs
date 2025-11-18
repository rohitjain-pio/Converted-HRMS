using FluentValidation;
using HRMS.Models.Models.UserProfile;
using System.Text.RegularExpressions;

namespace HRMS.API.Validations
{
    public class PersonalDetailRequestValidation : AbstractValidator<PersonalDetailsRequestDto>
    {
        public PersonalDetailRequestValidation()
        {
            RuleFor(x => x.FirstName).NotEmpty().NotNull().
                WithMessage("First name is required").MinimumLength(1).
                MaximumLength(50).WithMessage("Length should be less than 50 characters only").
                Matches("^[a-zA-Z0-9 _.-]*$").WithMessage("First name can only contain alphanumeric characters, underscores, spaces, dashes, and periods");

            RuleFor(x => x.LastName).NotNull().NotEmpty().
                WithMessage("Last name is required").MinimumLength(1).
                MaximumLength(50).WithMessage("Length should be less than 50 characters only").
                Matches("^[a-zA-Z0-9 _.-]*$").WithMessage("Last name can only contain alphanumeric characters, underscores, spaces, dashes, and periods");

            RuleFor(x => x.MiddleName).
               MaximumLength(50).WithMessage("Length should be less than 50 characters only").
               Matches("^[a-zA-Z0-9 _.-]*$").WithMessage("Middle name can only contain alphanumeric characters, underscores, spaces, dashes, and periods");

            RuleFor(x => x.FatherName).NotNull().NotEmpty().
               WithMessage("Father name is required").MinimumLength(1).
               MaximumLength(50).WithMessage("Length should be less than 50 characters only").
               Matches("^[a-zA-Z0-9 _.-]*$").WithMessage("Father name can only contain alphanumeric characters, underscores, spaces, dashes, and periods");
             
            RuleFor(x => x.Gender).NotNull().NotEmpty().
                WithMessage("Please choose the gender");

            RuleFor(x => x.DOB).NotNull().NotEmpty().
                WithMessage("Please select DOB");

            RuleFor(x => x.Phone).NotNull().NotEmpty().
                WithMessage("Phone no is required").MaximumLength(16).
                Must(ValidateForPhone).WithMessage("Phone number length must be between 10 to 12 digits");


            RuleFor(x => x.AlternatePhone).MaximumLength(16).
                Must(ValidateForPhone).WithMessage("AlternatePhone number length must be between 10 to 12 digits");


            RuleFor(x => x.EmergencyContactPerson).NotNull().NotEmpty().
                WithMessage("Emergency contact person name is required").MinimumLength(1).
               MaximumLength(100).WithMessage("Length should be less than 50 characters only").
               Matches("^[a-zA-Z0-9 _.-]*$").WithMessage("Emergency contact person name  can only contain alphanumeric characters, underscores, spaces, dashes, and periods");

            RuleFor(x => x.EmergencyContactNo).NotNull().NotEmpty().
                WithMessage("Emergency contact no is required").MaximumLength(16).
                Must(ValidateForPhone).WithMessage("EmergencyContact number length must be between 10 to 12 digits");

            RuleFor(x => x.PersonalEmail).NotNull().NotEmpty().
                MaximumLength(100).
                WithMessage("Email is required").EmailAddress().
                WithMessage("Please enter correct email only");

            RuleFor(x => x.Interest).MaximumLength(250)
               .WithMessage("Intrest should not exceed more than 250 characters");

            RuleFor(x => x.Address.Pincode)
          .NotNull().WithMessage("Pincode is required")
          .NotEmpty().WithMessage("Pincode is required")
          .MaximumLength(15).WithMessage("Pincode length should not exceed 15 characters");

            When(x => x.Address.CountryId == 101, () =>
            {
                RuleFor(x => x.Address.Pincode)
                    .Length(6).WithMessage("Pincode length should be 6")
                    .Matches("^[0-9]+$").WithMessage("Pincode must be numeric only");
            }); 
            When(x => x.Address.CountryId == 231, () =>
            {
                RuleFor(x => x.Address.Pincode) 
                    .Matches("^[0-9-]+$").WithMessage("Pincode must be numeric or contain hyphens only");
            });

             
           RuleFor(x => x.PermanentAddress.Pincode)
          .NotNull().WithMessage("Pincode is required")
          .NotEmpty().WithMessage("Pincode is required")
          .MaximumLength(15).WithMessage("Pincode length should not exceed 15 characters");

            When(x => x.PermanentAddress.CountryId == 101, () =>
            {
                RuleFor(x => x.Address.Pincode)
                    .Length(6).WithMessage("Pincode length should be 6")
                    .Matches("^[0-9]+$").WithMessage("Pincode must be numeric only");
            }); 

            When(x => x.PermanentAddress.CountryId == 231, () =>
            {
                RuleFor(x => x.PermanentAddress.Pincode)
                    .Matches("^[0-9-]+$").WithMessage("Pincode must be numeric or contain hyphens only");
            });
            
        }

        private bool ValidateForPhone(string arg)
        {
            if ((Regex.Match(arg, @"^(?:\+1 [\d-]{10,12}|\+91 [\d-]{10,12})$").Success) || string.IsNullOrWhiteSpace(arg))
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
