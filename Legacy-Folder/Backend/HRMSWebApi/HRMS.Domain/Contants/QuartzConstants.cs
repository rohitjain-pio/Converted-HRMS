namespace HRMS.Domain.Contants
{
    public static class QuartzConstants
    {
        public const string SaveNotificationJobKey = "SaveNotificationJobKey";
        public const string SendEmailNotificationJobKey = "SendEmailNotificationJobKey";
        public const string SaveNotificationJobIdentity = "SaveNotificationJob-trigger";
        public const string SendEmailNotificationJobIdentity = "SendEmailNotificationJob-trigger";
        public const string FetchTimeDoctorTimeSheetJobKey = "UpdateTimeSheetSummaryJobKey";
        public const string FetchTimeDoctorTimeSheetJobIdentity = "UpdateTimeSheetSummaryJob-trigger";
        public const string MonthlyCreditLeaveBalanceJobKey = "MonthlyCreditLeaveBalanceJobKey";
        public const string MonthlyCreditLeaveBalanceJobIdentity = "MonthlyCreditLeaveBalanceJob-trigger";
        public const string GrievanceLevelUpdateJobKey = "GrievanceLevelUpdateJobKey";
        public const string GrievanceLevelUpdateJobIdentity = "GrievanceLevelUpdate-trigger";
        public const string CompOffExpireJobKey = "CompOffExpireJobKey";
        public const string CompOffExpireJobIdentity = "CompOffExpireJobKey-trigger";
    }
}
