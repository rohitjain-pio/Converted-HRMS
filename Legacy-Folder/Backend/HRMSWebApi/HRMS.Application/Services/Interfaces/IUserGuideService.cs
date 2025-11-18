using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.UserGuide;

namespace HRMS.Application.Services.Interfaces
{
    public interface IUserGuideService
    {
        Task<ApiResponseModel<UserGuideResponseListDto>> GetAllUserGuideAsync(SearchRequestDto<GetAllUserGuideRequestDto> searchRequest);
        Task<ApiResponseModel<IEnumerable<MenuResponseDto>>> GetAllMenuName();
        Task<ApiResponseModel<CrudResult>> AddUserGuideAsync(AddUserGuide createDto);
        Task<ApiResponseModel<CrudResult>> UpdateUserGuideAsync(UpdateUserGuide updateDto);
        Task<ApiResponseModel<UserGuideByMenuIdDto>> GetUserGuideByMenuId(long MenuId);
        Task<ApiResponseModel<CrudResult>> DeleteUserGuideById(long userGuideId);
        Task<ApiResponseModel<UserGuideById>> GetUserGuideById(long Id);
    }
}