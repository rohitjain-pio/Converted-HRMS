using FluentValidation;
using HRMS.Domain.Contants;
using HRMS.Models.Models.UserProfile;
using System.Text.RegularExpressions;

namespace HRMS.API.Validations
{
    public class CurrentEmployerDocValidation : AbstractValidator<CurrentEmployerDocRequestDto>
    {
        public CurrentEmployerDocValidation()
        {
            RuleFor(x => x.EmployeeId)
                .NotNull().WithMessage("Employee Id can not be null.")
                .NotEmpty().WithMessage("Employee Id can not be empty.");

            RuleFor(x => x.EmployeeDocumentTypeId)
               .NotNull().WithMessage("Employee DocumentType can not be null.")
               .NotEmpty().WithMessage("Employee DocumentType can not be empty.");

            RuleFor(x => x.File).NotNull().NotEmpty().WithMessage("File is required")
                .Must(file => file != null && file.FileName.Length <= FileValidations.FileNameLength)
                .WithMessage("File name length must not exceeded 100 characters.")
                .Must(file => file != null && Regex.IsMatch(file.FileName, FileValidations.AllowCharsInFileName))
                .WithMessage("File name must be alphanumeric and can include dashes and underscores.")
                .Must(file => FileValidations.AllowOnlyPdf.Contains(Path.GetExtension(file!.FileName).ToLower()))
                .WithMessage("Only .pdf files are allowed.");
        }
    }
}
