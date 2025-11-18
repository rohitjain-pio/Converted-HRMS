using FluentValidation;
using HRMS.Models.Models.UserProfile;

namespace HRMS.API.Validations
{
  
        public class DesignationRequestValidation : AbstractValidator<DesignationRequestDto>
        {
            public DesignationRequestValidation()
            {
                RuleFor(x => x.Designation)
                   .NotNull().WithMessage("Department Name can not be null.");
            }
        }
    }



