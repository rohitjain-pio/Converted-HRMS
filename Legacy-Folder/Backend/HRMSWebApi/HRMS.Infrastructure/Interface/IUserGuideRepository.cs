using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Models.Models.UserGuide;

namespace HRMS.Infrastructure.Interface
{
    public interface IUserGuideRepository
    {
        Task<UserGuideResponseListDto> GetAllUserGuideAsync(SearchRequestDto<GetAllUserGuideRequestDto> request);
        Task<IEnumerable<MenuResponseDto>> GetAllMenuNameAsync();
        Task AddUserGuideAsync(UserGuide entity);
        Task UpdateUserGuideAsync(UserGuide entity);
        Task<UserGuideByMenuIdDto?> GetUserGuideByMenuIdAsync(long menuId);
        Task<bool> DeleteUserGuideByIdAsync(long userGuideId, string modifiedBy, DateTime modifiedOn);
        Task<UserGuideById?> GetUserGuideByIdAsync(long Id);






    }
}