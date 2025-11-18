using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HRMS.Models.Models.UserGuide
{
    public class MenuResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<SubMenuResponseDto> SubMenus { get; set; } = new();
    }

    public class SubMenuResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }


}