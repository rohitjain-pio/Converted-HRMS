namespace HRMS.Models.Models.Dashboard
{
    public class UpComingEventResponseDto
    {
        public long Id { get; set; }
        public string EventName { get; set; } = string.Empty;
        public string BannerFileName { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Venue { get; set; } = string.Empty;
    }
}
