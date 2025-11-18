namespace HRMS.Domain.Entities
{
    public class SurveyEmpGroupMapping : BaseEntity
    {
        public virtual Survey SurveyId { get; set; }
        public virtual Group EmpGroupId { get; set; }

    }
}
