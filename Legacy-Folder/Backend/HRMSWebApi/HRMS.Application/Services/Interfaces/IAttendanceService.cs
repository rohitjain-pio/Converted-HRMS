using HRMS.Models;
using HRMS.Models.Models.Attendance;
using HRMS.Domain.Enums;
using HRMS.Models.Models.AttendanceConfiguration;
using HRMS.Models.Models.EmployeeReport;
using HRMS.Domain.Entities;

namespace HRMS.Application.Services
{
        public interface IAttendanceService
        {
            Task<ApiResponseModel<CrudResult>> AddAttendanceAsync(long employeeId, AttendanceRequestDto attendanceRow);
            Task<ApiResponseModel<AttendanceResponseDto>> GetAttendanceByEmployeeIdAsync(long employeeId, string? dateFrom, string? dateTo, int pageIndex, int pageSize);
            Task<ApiResponseModel<CrudResult>> UpdateAttendanceAsync(long employeeId, AttendanceRequestDto attendanceRow, long? attendanceId);
            Task<ApiResponseModel<CrudResult>> UpdateConfigAsync(long employeeId);
            Task<ApiResponseModel<AttendancConfigSearchResponseDto>> GetAttendanceConfigListAsync(SearchRequestDto<AttendanceConfigSearchRequestDto> requestDto);
            Task<ApiResponseModel<EmployeeReportResponseDto>> GetEmployeeReport(SearchRequestDto<EmployeeReportSearchRequestDto> requestDto);
            Task<byte[]> GetAttendanceReportInExcel(SearchRequestDto<EmployeeReportSearchRequestDto> requestDto);
            Task<ApiResponseModel<List<EmployeeCodeServiceDto>>> GetEmployeeCodeAndNameListAsync(string? employeeCode, string? employeeName, bool exEmployee);
            Task<ApiResponseModel<CrudResult>> AddAttendanceTimeDoctorStatAsync(long employeeId, Attendance attendanceRow);
    }
}