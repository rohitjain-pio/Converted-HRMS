namespace HRMS.Models.Models.AdminExitEmployee
{
    public class UpdateLastWorkingDayRequestDto
    {
        public int ResignationId { get; set; }
        public DateOnly LastWorkingDay { get;  set; }
    }
}
