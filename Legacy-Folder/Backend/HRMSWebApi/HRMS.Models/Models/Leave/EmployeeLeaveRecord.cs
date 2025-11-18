using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Leave
{
    public class EmployeeLeaveRecord
    {
        public long EmployeeId { get; set; }
        public int LeaveId { get; set; }
        public decimal OpeningBalance { get; set; }
    }
    public class EmployeeLeaveInsert
    {
        public long EmployeeId { get; set; }
        public int LeaveId { get; set; }
        public decimal OpeningBalance { get; set; }
        public bool IsActive { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateOnly LeaveDate { get; set; }
    }

    public class AccrualUtilizedLeaveInsert
    {
        public long EmployeeId { get; set; }
        public int LeaveId { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public decimal Accrued { get; set; }
        public decimal UtilizedOrRejected { get; set; }
        public decimal ClosingBalance { get; set; }
        public DateTime CreatedOn { get; set; }
        public string CreatedBy { get; set; }
    }
}
