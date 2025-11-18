namespace HRMS.Models.Models.Dashboard
{
    public class HolidayResponseDto
    {
        public List<HolidayDto> India { get; set; } = new List<HolidayDto>();
        public List<HolidayDto> USA { get; set; } = new List<HolidayDto>();
    }
}
