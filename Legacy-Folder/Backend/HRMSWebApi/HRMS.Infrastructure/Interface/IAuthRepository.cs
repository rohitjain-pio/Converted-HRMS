using HRMS.Domain.Entities;
using HRMS.Models.Models.Auth;
using HRMS.Models.Models.CompanyPolicy;
using HRMS.Models.Models.Role;

namespace HRMS.Infrastructure.Interface
{
    public interface IAuthRepository : IGenericRepository<EmployeeData>
    {
        Task<LoginResponseDto?> GetUserByEmailId(string emailId,string username);
        Task<IEnumerable<MenuResponseDto>> GetMenuByRole(List<int> roleId);
        Task<IEnumerable<ModulePermissionDto>> GetModulePermissionByRole(List<int> roleId);
        Task<int> UpdateRefreshToken(RefreshToken refreshToken);
        Task<RefreshToken?> GetRefreshTokenByEmailId(string emailId);

    }
}
