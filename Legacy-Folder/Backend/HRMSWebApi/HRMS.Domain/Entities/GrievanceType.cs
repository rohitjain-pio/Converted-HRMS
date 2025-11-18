namespace HRMS.Domain.Entities
{
    public class GrievanceType : BaseEntity
    {
        public string GrievanceName { get; set; }
        public string Description { get; set; }
        public int L1TatHours { get; set; }
        public int L2TatHours { get; set; }
        public int L3TatDays { get; set; }
        public bool IsActive { get; set; }
        public bool IsAutoEscalation { get; set; }
        
    }
}