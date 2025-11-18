using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Employees
{
    public class EmployeeForTimeDoctorStatsDto
    {
        public int Id { get; set; } 
        public int EmployeeId { get; set; } 
        public string TimeDoctorUserId { get; set; }
    }
}
