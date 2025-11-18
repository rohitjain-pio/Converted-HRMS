using FluentValidation;
using HRMS.Domain.Contants;
using HRMS.Models.Models.Event;
using System.Text.RegularExpressions;

namespace HRMS.API.Validations
{
    public class EventRequestValidation : AbstractValidator<EventRequestDto>
    {
        public EventRequestValidation()
        {
            RuleFor(x => x.Title).NotEmpty().NotNull().MaximumLength(250).
                 WithMessage("Event Name is required")
                 .Matches("^(?!\\d+$).+$").WithMessage("This field cannot consist entirely of only numbers")
                  .MaximumLength(250).WithMessage("Event Name should not exceed more than 250 characters");

            RuleFor(x => x.Description).NotEmpty().NotNull()
                .WithMessage("Description is required");

            RuleFor(x => x.EventCategoryId).NotNull().NotEmpty().
                WithMessage("Event Category is required");

            RuleFor(x => x.Venue).NotNull().NotEmpty().
                WithMessage("Venue is required")
                .MaximumLength(250).WithMessage("Venue length should not exceed more than 250 characters")
                .Matches("^(?!\\d+$).+$").WithMessage("This field cannot consist entirely of only numbers");

            RuleFor(x => x.EmpGroupId).NotNull().NotEmpty().
                WithMessage("Employee Group is required");

            RuleFor(x => x.StartDate).NotNull().NotEmpty().
                WithMessage("Start Date is required");

            RuleFor(x => x.EndDate).NotNull().NotEmpty().
                WithMessage("End Date is required");

            RuleFor(x => x.StatusId).NotNull().NotEmpty().
                WithMessage("Status is required");

            RuleFor(x => x.EventUrl1).MaximumLength(250).
               WithMessage("EventUrl1 length should not exceed more than 250 characters");

            RuleFor(x => x.EventUrl2).MaximumLength(250).
               WithMessage("EventUrl2 length should not exceed more than 250 characters");


            RuleFor(x => x.EventUrl3).MaximumLength(250).
               WithMessage("EventUrl3 length should not exceed more than 250 characters");

            RuleFor(x => x.EventFeedbackSurveyLink).MaximumLength(250).
               WithMessage("EventFeedbackSurveyLink length should not exceed more than 250 characters");


            RuleFor(x => x.BannerFileContent)
                .Must(BeValidFileSize)
                .WithMessage($"File name should not be greater than 100 characters.")
                .Must(BeValidFileNameCharacter)
                .WithMessage($"File name must be alphanumeric and can include dashes and underscores like '{FileValidations.AllowCharsInFileName}'.")
                .Must(BeValidFileNameExtension)
                .WithMessage("Only jpg, jpeg and png files are allowed.");

            RuleFor(x => x.FileContent)
                .Must(BeValidFileSize)
                .WithMessage($"File name should not be greater than 100 characters.")
                .Must(BeValidFileNameCharacter)
                .WithMessage($"File name must be alphanumeric and can include dashes and underscores like '{FileValidations.AllowCharsInFileName}'.")
                .Must(BeValidFileNamePdfExtension)
                .WithMessage("Only pdf,jpg,jpeg,png files are allowed.")
                .Must(BeValidDocSize);
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

        private bool BeValidFileNamePdfExtension(IFormFile file)
        {
            if (file == null)
                return true;
            return FileValidations.AllowImageAndPdfTypes.Contains(Path.GetExtension(file!.FileName).ToLower());
        }

        private bool BeValidFileNameExtension(IFormFile file)
        {
            if (file == null)
                return true;
            return FileValidations.AllowImageTypes.Contains(Path.GetExtension(file!.FileName).ToLower());
        }
        private bool BeValidDocSize(IFormFile file)
        {
            if (file == null)
                return true;
            if (file.Length > FileValidations.FileSize)
                return false;
            return true;
        }
    }
}