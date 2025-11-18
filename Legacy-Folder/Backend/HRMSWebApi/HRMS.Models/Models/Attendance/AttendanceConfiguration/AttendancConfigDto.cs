using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRMS.Models.Models.AttendanceConfiguration
{
    public class AttendancConfigDto
    {
        public long? EmployeeId { get; set; }
        public long? CountryId { get; set; }
        public string? EmployeeCode { get; set; }
        public string? EmployeeName { get; set; }
        public string? EmployeeEmail { get; set; }
        public int? Branch { get; set; }
        public string? Designation { get; set; }
        public string? Department { get; set; }
        public string? Country { get; set; }
        public bool? IsManualAttendance { get; set; }
        public string? TimeDoctorUserId { get; set; }
        public DateOnly? JoiningDate { get; set; }
    }
}