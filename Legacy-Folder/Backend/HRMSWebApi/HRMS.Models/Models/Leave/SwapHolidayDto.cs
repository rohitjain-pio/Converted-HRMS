using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class SwapHolidayDto
    {
        public long Id { get; set; }
        public DateTime WorkingDate { get; set; }
        public DateTime LeaveDate { get; set; }
        public string? WorkingDateLabel { get; set; }
        public string? LeaveDateLabel { get; set; }

    }
}
