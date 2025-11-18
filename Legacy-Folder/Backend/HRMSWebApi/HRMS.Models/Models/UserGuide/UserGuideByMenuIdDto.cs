using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserGuide
{
    public class UserGuideByMenuIdDto
    {
        public long Id { get; set; }
        public required string Title { get; set; }
        public required string Content { get; set; }
        

    }
}