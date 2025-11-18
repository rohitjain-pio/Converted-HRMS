using FluentValidation;
using HRMS.Domain.Contants;
using HRMS.Models.Models.Auth;
using HRMS.Models.Models.UserProfile;
using System.Text.RegularExpressions;

namespace HRMS.API.Validations
{
    public class UploadFileRequestValidation : AbstractValidator<UploadFileRequest>
    {
        public UploadFileRequestValidation()
        {
            RuleFor(x => x.userId).NotNull().NotEmpty().GreaterThan(0).WithMessage("User Id is required");
            RuleFor(x => x.file).NotNull().NotEmpty().WithMessage("File is required")
                .Must(file => file != null && file.FileName.Length <= FileValidations.FileNameLength)
                .WithMessage("File name length must not exceeded 100 characters.")
                .Must(file => file != null && Regex.IsMatch(file.FileName, FileValidations.AllowCharsInFileName))
                .WithMessage("File name must be alphanumeric and can include dashes and underscores.")
                .Must(file => FileValidations.AllowImageTypes.Contains(Path.GetExtension(file!.FileName).ToLower()))
                .WithMessage("Only png, jpg, jpeg files are allowed.");
        }
    }
}
