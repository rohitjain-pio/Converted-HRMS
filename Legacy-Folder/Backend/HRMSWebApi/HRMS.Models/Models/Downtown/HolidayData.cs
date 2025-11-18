namespace HRMS.Models.Models.Downtown
{
    public class HolidayData
    {
        public Holidays holidays { get; set; } = new Holidays();
    }
    public class Holidays
    {
        public List<Holiday> India { get; set; } = new List<Holiday>();
        public List<Holiday> USA { get; set; } = new List<Holiday>();
    }
}
