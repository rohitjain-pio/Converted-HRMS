using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Grievance;



namespace HRMS.Infrastructure.Interface
{
    public interface IGrievanceRepository
    {
        Task AddGrievanceOwnerAsync(GrievanceOwner grievanceOwner);
        Task<int> AddGrievanceTypeAsync(GrievanceType grievanceType);
        Task<int> UpdateGrievanceTypeAsync(GrievanceType grievanceType);
        Task DeleteGrievanceAsync(GrievanceType type);
        Task<GrievanceListResponseDTO> GetAllGrievancesAsync();
        Task<GrievanceResponseDTO> GetGrievanceTypeByIdAsync(long grievanceTypeId);
        Task<EmployeeGrievanceResponseList> GetEmployeeGrievancesAsync(long EmployeeId, SearchRequestDto<EmployeeGrievanceFilterDto> request);
        Task<string> GenerateTicketNumberAsync(int grievanceTypeId);
        Task<long> InsertEmployeeGrievanceAsync(EmployeeGrievance employeeGrievance, string ticketNo);
        Task<EmployeeGrievanceDetail?> GetEmployeeGrievancesDetailAsync(long TicketId);
        Task<EmployeeListGrievanceResponseList> GetEmployeeListGrievancesAsync(int? SessionUserId, Roles RoleId, SearchRequestDto<EmployeeListGrievanceFilterDto> request);
        Task<EmployeeGrievanceRemarksDetail?> GetEmployeeGrievanceRemarksDetailAsync(long ticketId);
        //update methods
        Task<EmployeeGrievance?> GetEmployeeGrievanceByIdAsync(long ticketId);
        Task<List<int>> GetOwnersByGrievanceIdAndLevelAsync(int grievanceTypeId, int level);
        Task InsertGrievanceRemarkAsync(GrievanceRemarks remark);
        Task ResolveGrievanceAsync(long ticketId, int ownerId, GrievanceRemarks remark);
        Task EscalateGrievanceAsync(long ticketId, int newLevel, GrievanceRemarks remark);
        Task<string?> GetTicketNoByIdAsync(long ticketId);

        Task EscalateGrievanceByCronAsync();
        Task<bool> GrievanceViewAllowedAsync(long grievanceId,int? SessionUserId);

    }
}
