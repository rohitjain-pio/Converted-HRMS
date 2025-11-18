using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.SystemNotification
{
    public class EmailResponse
    {
        public bool Status {  get; set; }
        public string Message { get; set; }
    }

    public class EmailData
    {
        public string RequestId { get; set; }
    }
}
