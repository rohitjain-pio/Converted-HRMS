namespace HRMS.Models.Models.Auth
{
    public class RateLimitingOptions
    {
        public int Limit { get; set; }
        public int PeriodInMinutes { get; set; }
    }

}
