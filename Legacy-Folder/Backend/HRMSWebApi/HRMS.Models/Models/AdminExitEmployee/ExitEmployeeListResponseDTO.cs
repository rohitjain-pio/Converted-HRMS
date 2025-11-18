using HRMS.Models.Models.Employees;

namespace HRMS.Models.Models.AdminExitEmployee
{
    public class ExitEmployeeListResponseDTO
    {
        public ExitEmployeeListResponseDTO()
        {
            ExitEmployeeList = new List<AdminExitEmployeeResponseDto>();
        }
        public IEnumerable<AdminExitEmployeeResponseDto> ExitEmployeeList { get; set; }
        public int TotalRecords { get; set; }

    }
}
