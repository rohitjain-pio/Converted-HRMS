using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserProfile
{
    public class QualificationResponseDto
    {
        public int Id {get; set; }
        public string ShortName { get; set; }
    }
}
