namespace HRMS.Models.Models.Dashboard
{
    public class BirthdayResponseDto
    {
        public long Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string ProfileImagePath { get; set; } = string.Empty;
        public DateOnly DOB { get; set; }
    }
}
