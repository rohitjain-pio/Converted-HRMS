using FluentValidation;
using HRMS.Domain.Contants;
using HRMS.Models.Models.UserProfile;
using System.Text.RegularExpressions;
using HRMS.Domain.Enums;

namespace HRMS.API.Validations
{
    public class UserQualificationRequestValidation : AbstractValidator<UserQualificationInfoRequestDto>
    {
        public UserQualificationRequestValidation()
        {
            RuleFor(x => x.EmployeeId).NotNull().NotEmpty().GreaterThan(0)
                .WithMessage("EmployeeId is required");
            RuleFor(x => x.QualificationId).NotNull().NotEmpty().GreaterThan(0)
                .WithMessage("QualificationId is required");

            RuleFor(x => x.AggregatePercentage).NotNull().NotEmpty().InclusiveBetween(1.00, 100.00)
                .WithMessage("Aggregate Percentage must between 1.00 and 100.00");

            RuleFor(x => x.StartYear).NotEmpty().NotNull().Matches("^[0-9-]*$")
                .WithMessage("Please enter month and year values only for start year & must contain 7 characters only")
                .Must(ValidateForFutureDate).WithMessage("StartYear should not be future date")
                .Must((o, StartYear) => { return ValidateDate(StartYear, o.EndYear); }).WithMessage("StartYear should be less then EndYear")
                .MaximumLength(7).WithMessage("StartYear should not exceed more than 7 characters");

            RuleFor(x => x.EndYear).NotEmpty().NotNull().Matches("^[0-9-]*$").MaximumLength(7)
                .WithMessage("Please enter month and year values only for end year & must contain 7 characters only")
                .Must(ValidateForFutureDate).WithMessage("EndYear should not be future date")
                .Must((o, EndYear) => { return ValidateDate(o.StartYear, EndYear); }).WithMessage("EndYear should be greater then StartYear");

            RuleFor(x => x.CollegeUniversity).NotEmpty().NotNull().Must(ValidateForNotAllowOnlyNumbers)
                .WithMessage("Please enter college or university properly")
                .MaximumLength(250).WithMessage("CollegeUniversity should not exceed more than 250 characters");

            RuleFor(x => x.DegreeName).NotEmpty().NotNull().Must(ValidateForNotAllowOnlyNumbers)
                .WithMessage("Please enter degree name  properly")
                .MaximumLength(250).WithMessage("DegreeName should not exceed more than 250 characters");

            RuleFor(x => x.File)
                .Must(BeValidFileSize)
                .WithMessage("File name length must not exceeded 100 characters.")
                .Must(BeValidFileNameCharacter)
                .WithMessage($"File name must be alphanumeric and can include dashes and underscores like '{FileValidations.AllowCharsInFileName}'.")
                .Must(BeValidFileNameExtension)
                .WithMessage("Only pdf,jpeg,png,jpg files are allowed.");
        }
        private bool ValidateForNotAllowOnlyNumbers(string arg)
        {
            if (Regex.Match(arg, "^(?!\\d+$).+$").Success)
            {
                return true;
            }
            else
            {
                return false;
            }
        }

        private bool ValidateForFutureDate(string arg)
        {
            DateTime temp;
            if (DateTime.TryParse(arg, out temp))
            {
                if (temp > DateTime.UtcNow)
                {
                    return false;
                }
                return true;
            }
            return false;
        }

        private bool ValidateDate(string startYear, string endYear)
        {
            DateTime startYearDate = Convert.ToDateTime(startYear);
            DateTime endYearDate = Convert.ToDateTime(endYear);
            if (startYearDate >= endYearDate)
            {
                return false;
            }
            return true;
        }

        private bool BeValidFileSize(IFormFile file)
        {
            if (file == null)
                return true;
            return file.FileName.Length <= FileValidations.FileNameLength;
        }

        private bool BeValidFileNameCharacter(IFormFile file)
        {
            if (file == null)
                return true;
            return Regex.IsMatch(file.FileName, FileValidations.AllowCharsInFileName);
        }

        private bool BeValidFileNameExtension(IFormFile file)
        {
            if (file == null)
                return true;
            return FileValidations.AllowImageAndPdfTypes.Contains(Path.GetExtension(file!.FileName).ToLower());
        }
    }
}

