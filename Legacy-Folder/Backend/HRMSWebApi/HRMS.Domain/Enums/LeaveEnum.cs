using System.ComponentModel;

namespace HRMS.Domain.Enums
{
    public enum LeaveEnum
    {
        [Description("Casual Leave")]
        CL = 1,

        [Description("Earned Leave")]
        EL = 2,

        [Description("Bereavement Leave")]
        BL = 3,

        [Description("Advance Leave")]
        AL = 5,

        [Description("Leave in Bucket")]
        LB = 6,

        [Description("Loss Of Pay")]
        LOP = 7,

        [Description("Paternity Leave")]
        PL = 8,

        [Description("Maternity Leave")]
        ML = 9,

        [Description("Comp Off")]
        CO = 10
    }

}
