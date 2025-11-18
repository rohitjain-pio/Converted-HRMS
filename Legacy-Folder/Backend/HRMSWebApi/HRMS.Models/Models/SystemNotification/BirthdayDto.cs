using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.SystemNotification
{
    public class BirthdayDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime DOB { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Designation {  get; set; } = string.Empty;
        public string ProfilePhoto { get; set; } = string.Empty;
             
    }
}
