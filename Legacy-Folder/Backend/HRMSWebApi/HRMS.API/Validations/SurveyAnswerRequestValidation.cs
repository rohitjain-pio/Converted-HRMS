using FluentValidation;
using HRMS.Models.Models.Survey;

namespace HRMS.API.Validations
{
    public class SurveyAnswerRequestValidation : AbstractValidator<SurveyAnswerRequestDto>
    {
        public SurveyAnswerRequestValidation()
        {
            RuleFor(x => x.EmployeeId).NotEmpty().NotNull().
               WithMessage("Employee Id is required");             

            RuleFor(x => x.SurveyId).NotEmpty().NotNull()
                .WithMessage("Survey Id is required");            
                
            RuleFor(x => x.SurveyJsonResponse).NotEmpty().NotNull().
                WithMessage("SurveyJson is required");

        }
    }
}
