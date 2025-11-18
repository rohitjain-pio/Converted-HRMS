using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRMS.Domain.Enums;

namespace HRMS.Models.Models.UserGuide
{
    public class GetAllUserGuideRequestDto
    {
        public DateOnly? ModifiedOn { get; set; }
        public DateOnly? CreatedOn { get; set; }
        public string? MenuName { get; set; }
        public UserGuideStatus? Status { get; set; }
        public string? Title { get; set; }

        
    }
}