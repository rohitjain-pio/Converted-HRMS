using System.Collections.Generic;

namespace HRMS.Models.Models.AttendanceConfiguration
{
    public class AttendancConfigSearchResponseDto
    {
        public List<AttendancConfigDto>? AttendanceConfigList { get; set; }
        public int TotalRecords { get; set; }
    }
}
