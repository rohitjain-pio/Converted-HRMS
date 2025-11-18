using HRMS.Domain.Enums;

namespace HRMS.Domain.Utility
{
    public static class LeaveBalanceHelper
    {
        public class OpeningLeaveBalanceDto
        {
            public float Casual { get; set; }
            public float Earned { get; set; }
            public float Breavement { get; set; }
            public float Paternity { get; set; }
            public float Maternity { get; set; }
            public float Advance { get; set; }
        }
        public static class OpeningLeaveBalanceValues
        {
            public const float DefaultCasualLeaves = 0f;
            public const float DefaultEarnedLeaves = 0f;
            public const float EarnedCreditArrualLateJoin = 0.5f;
            public const float BreavementLeaves = 3.0f;
            public const float MaternityLeaves = 180.0f;
            public const float PaternityLeaves = 7.0f;
        }
        public static OpeningLeaveBalanceDto GetOpeningBalance(DateTime joiningDate, LeavesAccrualOptions options, Gender? gender = null)
        {
            var monthlyDates = GetMonthlyDates(joiningDate, DateTime.UtcNow);

            float casualLeaves = OpeningLeaveBalanceValues.DefaultCasualLeaves;
            float earnedLeaves = OpeningLeaveBalanceValues.DefaultEarnedLeaves;
            foreach (var md in monthlyDates)
            {
                casualLeaves = GetClosingMonthlyBalance(LeaveEnum.CL, casualLeaves, options, md, joiningDate);
                earnedLeaves = GetClosingMonthlyBalance(LeaveEnum.EL, earnedLeaves, options, md, joiningDate);
            }
            //float parentalLeaves = gender == Gender.Female ? OpeningLeaveBalanceValues.MaternityLeaves : gender == Gender.Male ? OpeningLeaveBalanceValues.PaternityLeaves: 0;
            float breavementLeaves = OpeningLeaveBalanceValues.BreavementLeaves;

            return new OpeningLeaveBalanceDto
            {
                Casual = casualLeaves,
                Earned = earnedLeaves,
                //Parental = parentalLeaves,
                Paternity = gender == Gender.Female ? 0f : OpeningLeaveBalanceValues.PaternityLeaves,
                Maternity = gender == Gender.Male ? 0f : OpeningLeaveBalanceValues.MaternityLeaves,
                Breavement = breavementLeaves
            };
        }
        private static float GetClosingMonthlyBalance(LeaveEnum type, float openingBalance, LeavesAccrualOptions options, DateTime forDateTime, DateTime joinDT)
        {
            int nullMonth = options.CarryOverMonth;
            forDateTime = new DateTime(forDateTime.Year, forDateTime.Month, 1);
            switch (type)
            {
                case LeaveEnum.CL: // casual
                    {
                        var credit = options.Casual.MonthlyCredit;
                        if (forDateTime.Month == nullMonth)
                        {
                            return credit;
                        }
                        if (joinDT.Month == forDateTime.Month && joinDT.Year == forDateTime.Year)
                        {
                            if (joinDT.Day < 11) return openingBalance + credit;
                            return openingBalance;
                        }
                        return openingBalance + credit;
                    }
                case LeaveEnum.EL: // earned
                    {
                        var credit = options.Earned.MonthlyCredit;
                        const float initialLateCredit = OpeningLeaveBalanceValues.EarnedCreditArrualLateJoin;
                        var maxCarryOver = options.Earned.YearlyCarryOverLimit;
                        // probation
                        //if (joinDT.AddMonths(probationMonths) > forDateTime) return openingBalance;
                        if (forDateTime.Month == nullMonth)
                        {
                            return Math.Min(openingBalance, maxCarryOver) + credit;
                        }
                        if (joinDT.Month == forDateTime.Month && joinDT.Year == forDateTime.Year)
                        {
                            if (joinDT.Day < 11) return openingBalance + credit;
                            else if (joinDT.Day < 21) return openingBalance + initialLateCredit;
                            return openingBalance;
                        }
                        return openingBalance + credit;
                    }
                default: return openingBalance;
            }
        }
        static List<DateTime> GetMonthlyDates(DateTime start, DateTime end)
        {
            var dates = new List<DateTime>();

            var current = new DateTime(start.Year, start.Month, 1);
            end = new DateTime(end.Year, end.Month, 1);
            while (current <= end)
            {
                dates.Add(current);
                current = current.AddMonths(1);
            }
            return dates;
        }
        public static bool isDTLastMonth(DateTime dt, DateTime fromtDt)
        {
            return dt.AddMonths(1).Month == fromtDt.Month && dt.AddMonths(1).Year == fromtDt.Year;
        }
    }
}
