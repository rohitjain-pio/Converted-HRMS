namespace HRMS.Models.Models.Grievance
{
    public class GrievanceRequestDTO
    {
        public long Id { get; set; }
        public string GrievanceName { get; set; }
        public string? Description { get; set; }
        public int L1TatHours { get; set; }
        public string L1OwnerIds { get; set; } // Comma-separated string of owner IDs
        public int L2TatHours { get; set; }
        public string L2OwnerIds { get; set; } // Comma-separated string of owner IDs
        public int L3TatDays { get; set; }
        public string L3OwnerIds { get; set; } // Comma-separated string of owner IDs
        public bool IsAutoEscalation { get; set; }
    }


}