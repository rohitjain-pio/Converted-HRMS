using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Attendance;
using HRMS.Models.Models.AttendanceConfiguration;
using HRMS.Models.Models.EmployeeReport;


namespace HRMS.Infrastructure.Interface
{
    public interface IAttendanceRepository
    {
        Task<int> AddAttendanceAsync(long employeeId, Attendance attendanceRow);
        Task<int> UpdateAttendanceAsync(long employeeId, Attendance attendanceRow, long attendanceId);
        Task<Attendance?> GetAttendanceByIdAsync(long attendanceId);
        Task<AttendanceResponseDto> GetAttendanceByEmployeeIdAsync(long employeeId, string? dateFrom, string? dateTo, int pageIndex, int pageSize);
        Task<int> UpdateAttendanceConfigAsync(AttendanceConfigRequestDto attendanceRow);
        Task UpdateTimeDoctorUserId(long empId, string? timeDoctorUserId);
        Task<bool> GetConfigByEmployeeIDAsync(long employeeId);
        Task<string?> GetConfigTimeDoctorUserIdByEmployeeIDAsync(long employeeId);
        Task<AttendancConfigSearchResponseDto> GetAttendanceConfigListAsync(int? ReportingManagerId, SearchRequestDto<AttendanceConfigSearchRequestDto> requestDto);
        Task<EmployeeReportResponseDto> GetEmployeeReport(int? ReportingManagerId, SearchRequestDto<EmployeeReportSearchRequestDto> requestDto);
        Task<long?> AttendanceExistsAsync(long employeeId, string date);
        Task<List<EmployeeCodeServiceDto>> GetEmployeeCodeAndNameListAsync(Roles RoleId, int? SessionUserId,string? employeeCode, string? employeeName, bool exEmployee);
        Task<List<string>> GetAttendanceDateList(long employeeId);
        Task<byte[]> GenerateAttendanceReportExcelFile(List<EmployeeReportDto> employees, DateTime fromDate, DateTime toDate);
    }
}