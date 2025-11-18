using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Models.Models.EmployeeGroup;

namespace HRMS.Infrastructure.Interface
{
    public interface IEmployeeGroupRepository
    {
        Task<IEnumerable<Group>> GetEmployeeGroups();
        Task<int> CreateGroup(Group group);
        Task<bool> GroupNameExistsAsync(string groupName);
        Task<int> UpdateGroup(Group group);        
        Task<int> DeleteAsync(long id);
        Task<Group?> GetEmployeeGroupById(long id);
        Task<IEnumerable<EmployeeDto>> GetAllEmployees();
        Task<EmployeeGroupResponseDto?> GetEmployeeGroupDetailsById(long id);
        Task<EmployeeGroupSearchResponseDto> GetEmployeeGroupList(SearchRequestDto<EmployeeGroupSearchRequestDto> requestDto);
        Task<bool> ValidateEmployeeIdsAsync(List<long> EmployeeIds);
        Task<bool> ValidateGroupIdAsync(long id);
    }
}
