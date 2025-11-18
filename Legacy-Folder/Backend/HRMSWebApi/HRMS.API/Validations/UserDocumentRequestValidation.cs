using FluentValidation;
using HRMS.Domain.Contants;
using HRMS.Models.Models.UserProfile;
using System.Text.RegularExpressions;

namespace HRMS.API.Validations
{
    public class UserDocumentRequestValidation : AbstractValidator<UserDocumentRequestDto>
    {
        public UserDocumentRequestValidation()
        {
            RuleFor(x => x.EmployeeId).NotNull().NotEmpty().
                WithMessage("EmployeeId is required");

            RuleFor(x => x.DocumentTypeId).NotNull().NotEmpty().
               WithMessage("DocumentTypeId is required");

            RuleFor(x => x.DocumentNumber).NotNull().NotEmpty().
              WithMessage("Document Number is required");

            RuleFor(x => x.File)
                .Must(BeValidFileSize)
                .WithMessage("File name length must not exceeded 100 characters.")
                .Must(BeValidFileNameCharacter)
                .WithMessage($"File name must be alphanumeric and can include dashes and underscores like '{FileValidations.AllowCharsInFileName}'.")
                .Must(BeValidFileNameExtension)
                .WithMessage("Only pdf,jpg,jpeg,png files are allowed.");
            
             RuleFor(x => x.DocumentExpiry)
                .Must(BeValidDateExpiryGreaterThanTodayDate)
                .WithMessage("Document expiry date must be greater than today's date.");
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

        private bool BeValidDateExpiryGreaterThanTodayDate(DateOnly? dateOnly)
        {
           if (dateOnly == null)
                return true;
            return dateOnly > DateOnly.FromDateTime(DateTime.Today);
        }
    }
}
