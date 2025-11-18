using System.ComponentModel;

namespace HRMS.Domain.Enums
{
    public enum EmployeeStatus
    {
        [Description("Active")]
        Active = 1,
        [Description("F&F Pending")]
        FnFPending = 2,
        [Description("On Notice")]
        OnNotice = 3,
        [Description("Ex Employee")]
        ExEmployee = 4
    }
}
