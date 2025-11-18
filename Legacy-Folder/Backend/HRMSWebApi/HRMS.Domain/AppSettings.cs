namespace HRMS.Domain
{
    public class ConnectionStrings
    {
        public string DefaultConnection { get; set; }
    }

    public class Jwt
    {
        public string Key { get; set; }
        public string Issuer { get; set; }
        public string Audience { get; set; }
        public int ValidHours { get; set; }
    }
    public class HttpClientsUrl
    {
        public string GraphApiUrl { get; set; }
        public string DownTownApiUrl { get; set; }
        public string DownTownApiToken { get; set; }
        public string EmailNotificationApiUrl { get; set; }
        public string EmailNotificationApiToken { get; set; }
        public string TimeDoctorApiToken { get; set; }
        public string TimeDoctorTimeSheetSummaryStatsUrl { get; set; }
        public string TimeDoctorTimeSheetUsersUrl { get; set; }
    }
    public class AppSettings
    {
        public ConnectionStrings ConnectionStrings { get; set; }
        public Jwt Jwt { get; set; }
        public Logging Logging { get; set; }
        public string[] Cors { get; set; }
        public HttpClientsUrl HttpClientsUrl { get; set; }
        public EmailSMTPSettings EmailSMTPSettings { get; set; }
    }

    public class Logging
    {
        public RequestResponse RequestResponse { get; set; }
    }

    public class RequestResponse
    {
        public bool IsEnabled { get; set; }
    }

    public class LeavesAccrualOptions
    {
        public LeavesAccrualOptionData Casual { get; set;}
        public LeavesAccrualOptionData Earned { get; set; }
        public int CarryOverMonth { get; set; }
        public bool? Testing { get; set; }
        public class LeavesAccrualOptionData
        {
            public float MonthlyCredit { get; set; }
            public float YearlyCarryOverLimit { get; set; }
        }
    }
    public class EmailSMTPSettings
    {
        public string SmtpServer { get; set; }
        public int SmtpPort { get; set; }
        public string SenderName { get; set; }
        public string SenderEmail { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public int MaxConcurrentConnections { get; set; }
    }
}
