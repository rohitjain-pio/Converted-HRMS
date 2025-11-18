using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class LeaveHistoryFilterDto
    {
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public LeaveEnum LeaveType { get; set; }
    }
}
