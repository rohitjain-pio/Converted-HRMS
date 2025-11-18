using HRMS.Models;
using HRMS.Models.Models.EmployeeReport;

namespace HRMS.Application.Services.Interfaces
{
    public interface IEmployeeReportService
    {
        Task<ApiResponseModel<EmployeeReportResponseDto>> GetEmployeeReport(SearchRequestDto<EmployeeReportSearchRequestDto> requestDto);
    }
}
