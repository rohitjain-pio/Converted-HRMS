using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class LeaveHistoryTotalRecordsResponseDto
    {
        public List<LeaveHistoryResponseDto> leaveHistoryList { get; set; }
        public int TotalRecords { get; set; }
        
    }
}
