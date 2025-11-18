using HRMS.Models;
using HRMS.Models.Models.EmployeeGroup;
using HRMS.Domain.Enums;

namespace HRMS.Application.Services.Interfaces
{
    public interface IEmployeeGroupService 
    {
        Task<ApiResponseModel<IEnumerable<GroupResponseDto>>> GetEmployeeGroups();
        Task<ApiResponseModel<CrudResult>> CreateGroup(EmployeeGroupRequestDto employeeGroupRequest);
        Task<ApiResponseModel<CrudResult>> UpdateGroup(EmployeeGroupRequestDto employeeGroupRequest);
        Task<ApiResponseModel<CrudResult>> Delete(long id);
        Task<ApiResponseModel<IEnumerable<EmployeeDto>>> GetAllEmployees();
        Task<ApiResponseModel<EmployeeGroupResponseDto>> GetEmployeeGroupDetailsById(long id);
        Task<ApiResponseModel<EmployeeGroupSearchResponseDto>> GetEmployeeGroupList(SearchRequestDto<EmployeeGroupSearchRequestDto> requestDto);
        
    }
}
