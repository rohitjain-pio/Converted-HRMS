using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Leave
{
    public class AccrualsUtilizedListResponseDto
    {

        
       public List<AccrualsUtilizedResponseDto> result { get; set; }
        public int totalCount { get; set; }
       
    }
}
