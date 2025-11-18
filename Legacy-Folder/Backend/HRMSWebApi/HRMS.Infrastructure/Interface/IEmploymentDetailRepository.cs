using HRMS.Domain.Entities;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.UserProfile;
using static HRMS.Domain.Utility.LeaveBalanceHelper;

namespace HRMS.Infrastructure.Interface
{
    public interface IEmploymentDetailRepository : IGenericRepository<EmploymentDetail>
    {
        Task<long> AddEmploymentDetailAsync(EmploymentDetail employmentDetail, EmployeeData employeeData);
        Task<int> UpdateEmploymentDetailAsync(EmploymentDetail employmentDetail);
        Task<int> ArchiveUnarchiveEmploymentDetails(EmployeeArchiveRequestDto employeeArchiveRequestDto);
        Task<EmploymentResponseDto?> GetEmplyementDetailByIdAsync(long id);
        Task<IEnumerable<EmployerDocumentType>> GetEmployerDocumentTypeList(int documentFor);
        Task<IEnumerable<EmployeeForTimeDoctorStatsDto>> GetEmployeesForTimeDoctorStats(DateOnly date);
        Task<int> SaveCurrentEmployerDocument(CurrentEmployerDocument currentEmployerDocument);
        Task<bool> IsEmailExists(string Email);
        Task<int> ArchiveUnarchiveDepartment(DepartmentArchiveRequestDto departmentArchiveRequestDto);
        Task<int> ArchiveUnarchiveTeam(ArchiveTeamRequestDto teamArchiveRequestDto);
        Task<int> ArchiveUnarchiveDesignation(DesignationArchiveRequestDto designationArchiveRequestDto);
        Task<bool> IsEmpCodeExist(string empCode);
        Task<bool> IsTimeDoctorUserIdExists(long employeeId, string timeDoctorUserId);
        Task<int> AddIfNotExistsEmployeeOpeningLeaveBalance(long employeeId, OpeningLeaveBalanceDto leaveBalance);
        Task<EmploymentDetailsForDwnTwn?> GetEmplyementDetailAsync(string Email);

    }
}