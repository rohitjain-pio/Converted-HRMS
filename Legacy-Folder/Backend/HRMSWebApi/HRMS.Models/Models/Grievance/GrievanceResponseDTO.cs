namespace HRMS.Models.Models.Grievance
{
    public class GrievanceResponseDTO
    {
        public long Id { get; set; }
        public string GrievanceName { get; set; }
        public string Description { get; set; }
        public int L1TatHours { get; set; }
        public string L1OwnerId { get; set; }
        public string L1OwnerName { get; set; }
        public int L2TatHours { get; set; }
        public string L2OwnerId { get; set; }
        public string L2OwnerName { get; set; }
        public int L3TatDays { get; set; }
        public string L3OwnerId { get; set; }
        public string L3OwnerName { get; set; }
        public bool IsAutoEscalation { get; set; }
    }

}