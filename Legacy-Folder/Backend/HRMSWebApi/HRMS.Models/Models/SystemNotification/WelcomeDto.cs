using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.SystemNotification
{
    public class WelcomeDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public string ProfilePhoto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Departmentname {  get; set; } = string.Empty; 
        public BranchLocation Branch {  get; set; } 
    }
}
