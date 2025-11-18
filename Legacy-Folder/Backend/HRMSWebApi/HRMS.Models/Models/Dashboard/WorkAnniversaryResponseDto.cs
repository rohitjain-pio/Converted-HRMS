namespace HRMS.Models.Models.Dashboard
{
    public class WorkAnniversaryResponseDto
    {
        public long Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string MiddleName { get; set; }= string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateOnly? JoiningDate { get; set; }
        public string ProfilePicPath { get; set; } = string.Empty;
    }
}
