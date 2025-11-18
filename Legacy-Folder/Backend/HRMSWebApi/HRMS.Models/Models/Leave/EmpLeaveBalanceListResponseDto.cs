using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Leave
{
    public class EmpLeaveBalanceListResponseDto
    {
        public IEnumerable<EmpLeaveBalanceResponseDto> Data { get; set; }
    }
}
