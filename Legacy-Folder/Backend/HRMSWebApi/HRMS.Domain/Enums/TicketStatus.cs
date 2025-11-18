using System.ComponentModel;

namespace HRMS.Domain.Enums
{
    public enum TicketStatus
    {

        [Description("Ticket is open and awaiting action")]
        Open = 1,

        [Description("In Progress")]
        InProgress = 2,

        [Description("Unable to reproduce")]
        UnableToReproduce = 3,

        [Description("Not fixing")]
        NotFixing = 4,

        [Description("Not Applicable")]
        NotApplicable = 5,

        [Description("Ticket has been closed")]
        Closed = 6,

    }

}
