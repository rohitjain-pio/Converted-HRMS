using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class SwapHolidayApplyRequestDto
    {
        public long EmployeeId { get; set; }
        public DateOnly WorkingDate { get; set; }
        public DateOnly? LeaveDate { get; set; }
        public string? WorkingDateLabel { get; set; }
        public string? LeaveDateLabel { get; set; }
        public string? Reason { get; set; }
        
    }
}
