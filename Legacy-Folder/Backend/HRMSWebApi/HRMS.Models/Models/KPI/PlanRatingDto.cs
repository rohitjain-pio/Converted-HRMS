namespace HRMS.Models.Models.KPI
{
    public class PlanRatingDto
    {
        public long PlanId { get; set; }
        public DateOnly? ReviewDate { get; set; }
        public bool? IsReviewed { get; set; }
        public DateOnly? LastAppraisal { get; set; }
        public DateOnly? NextAppraisal { get; set; }
        public List<GetSelfRatingListDto> Goals { get; set; } = new List<GetSelfRatingListDto>();

    }
}
