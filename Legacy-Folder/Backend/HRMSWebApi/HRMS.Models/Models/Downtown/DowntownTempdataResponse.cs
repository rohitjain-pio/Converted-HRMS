namespace HRMS.Models.Models.Downtown
{
   public class DowntownTempdataResponse
    {
        public long Id { get; set; }
        public string First_Name { get; set; } = string.Empty;
        public string Last_Name { get; set; } = string.Empty;
        public string Photo { get; set; } = string.Empty;
        public string? Gender { get; set; }
        public DateTime? DOB { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Alternate_Phone_Number { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? Country { get; set; }
        public string Joining_date { get; set; } = string.Empty;
        public string? Branch_title { get; set; }
        public int? Team_id { get; set; }
        public string? Team_Title { get; set; }
        public string? Designation { get; set; }
        public string? Status { get; set; }
        public bool IsSynched { get; set; }
        public DateTime? Created_at { get; set; }
        public DateTime? Updated_at { get; set; }
        public DateTime? deleted_at { get; set; }
    }
}
