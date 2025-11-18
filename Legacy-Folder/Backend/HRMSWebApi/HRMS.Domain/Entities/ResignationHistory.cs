using HRMS.Domain.Enums;

namespace HRMS.Domain.Entities
{
    public class ResignationHistory
    {
        public long Id { get; set; }
        public int ResignationId { get; set; }
        public ResignationStatus ResignationStatus { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; }
        public EarlyReleaseStatus EarlyReleaseStatus { get; set; }
    }
}

