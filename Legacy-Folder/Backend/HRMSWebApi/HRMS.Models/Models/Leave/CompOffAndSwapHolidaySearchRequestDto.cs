using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class CompOffAndSwapHolidaySearchRequestDto
    {
        public LeaveStatus? Status { get; set; }
        public DateOnly? WorkingDate { get; set; }
        public RequestType? Type { get; set; }
        public string? EmployeeCode { get; set; }
    }

}
