using HRMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Employees
{
    public class EmployeeListResponseDto
    { 
        public int Id { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }   
        public string Country { get; set; } 
        public string Email { get; set; } 
        public DateTime JoiningDate { get; set; } 
        public JobType JobType { get; set; }
        public int Branch { get; set; }    
        public string DepartmentName { get; set; }
        public string Designation { get; set; }   
        public string Phone { get; set; }
        public string PersonalEmail { get; set; }  
        public string EmployeeStatus { get; set; } 
    }
}
