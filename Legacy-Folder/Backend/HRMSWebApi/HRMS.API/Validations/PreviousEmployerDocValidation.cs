using FluentValidation;
using HRMS.Domain.Contants;
using HRMS.Models.Models.UserProfile;
using System.Text.RegularExpressions;

namespace HRMS.API.Validations
{
    public class PreviousEmployerDocValidation : AbstractValidator<PreviousEmployerDocRequestDto>
    {
        public PreviousEmployerDocValidation()
        {
            RuleFor(x => x.PreviousEmployerId)
                .NotNull().WithMessage("Previous Employer can not be null.")
                .NotEmpty().WithMessage("Previous Employer can not be empty.");

            RuleFor(x => x.EmployerDocumentTypeId)
               .NotNull().WithMessage("Employer DocumentType can not be null.")
               .NotEmpty().WithMessage("Employer DocumentType can not be empty.");

            RuleFor(x => x.File).NotNull().NotEmpty().WithMessage("File is required")
                .Must(file => file != null && file.FileName.Length <= FileValidations.FileNameLength)
                .WithMessage("File name length must not exceeded 100 characters.")
                .Must(file => file != null && Regex.IsMatch(file.FileName, FileValidations.AllowCharsInFileName))
                .WithMessage("File name must be alphanumeric and can include dashes and underscores.")
                .Must(file => FileValidations.AllowImageAndPdfTypes.Contains(Path.GetExtension(file!.FileName).ToLower()))
                .WithMessage("Only pdf,jpg,jpeg,png files are allowed.");
        }
    }
}
