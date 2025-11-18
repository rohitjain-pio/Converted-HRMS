using AutoMapper;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models.Role;
using HRMS.Models.Models.RolePermission;
using Microsoft.AspNetCore.Http;
using System.Net;
using System.Text.Json;

namespace HRMS.Application.Services
{
    public class RolePermissionService : TokenService, IRolePermissionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEmailNotificationService _email;
      public RolePermissionService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor , IEmailNotificationService email) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _email = email;
        }
        public async Task<ApiResponseModel<RoleSearchResponseDto>> GetRoles(SearchRequestDto<RoleRequestSearchDto> requestDto)
        {
            RoleSearchResponseDto roleSearchResponseDto = await _unitOfWork.RolePermissionRepository.GetRoles(requestDto);
            if (roleSearchResponseDto != null && roleSearchResponseDto.RoleResponseList.Any())
            {
                return new ApiResponseModel<RoleSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, roleSearchResponseDto);
            }
            else
            {
                return new ApiResponseModel<RoleSearchResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<ModulePermissionsResponseDto>> GetModulePermissionsByRole(int roleId)
        {
            ModulePermissionsResponseDto model = new ModulePermissionsResponseDto();
            var moduleListPermissionDto = await _unitOfWork.RolePermissionRepository.GetModulePermissionByRole(roleId);
            if (moduleListPermissionDto != null && moduleListPermissionDto.Any())
            {
                model.RoleId = roleId;
                ModulePermissionDto? module = moduleListPermissionDto.FirstOrDefault(m => !string.IsNullOrEmpty(m.RoleName));
                model.RoleName = module != null ? module.RoleName : string.Empty;

                var moduleGroup = moduleListPermissionDto.GroupBy(m => m.ModuleId).ToList();
                foreach (var moduleGroupDto in moduleGroup)
                {
                    ModuleDto moduleModel = new ModuleDto();
                    moduleModel.ModuleId = moduleGroupDto.AsEnumerable().First().ModuleId;
                    moduleModel.ModuleName = moduleGroupDto.AsEnumerable().First().ModuleName;
                    foreach (var item in moduleGroupDto)
                    {
                        PermissionDto permissionModel = new PermissionDto();
                        permissionModel.PermissionId = item.PermissionId;
                        permissionModel.PermissionName = item.PermissionName;
                        permissionModel.IsActive = item.IsActive;
                        moduleModel.Permissions.Add(permissionModel);
                    }
                    moduleModel.IsActive = moduleModel.Permissions.Exists(m => m.IsActive);
                    model.Modules.Add(moduleModel);
                }

                return new ApiResponseModel<ModulePermissionsResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, model);
            }
            else
            {
                return new ApiResponseModel<ModulePermissionsResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.RoleNotExist, null);
            }
        }

        public async Task<ApiResponseModel<bool>> SaveRolePermissions(RolePermissionRequestDto model)
        {
            if (model != null && model.RoleId > 0)
            {
                if (model.IsRoleNameUpdate && !string.IsNullOrEmpty(model.RoleName))
                {
                    await _unitOfWork.RolePermissionRepository.UpdateRoleName(model.RoleId, model.RoleName);
                }
                if (model.IsRolePermissionUpdate)
                {
                    await _unitOfWork.RolePermissionRepository.SaveRolePermission(model.RoleId, model.PermissionList);
                }
                
                return new ApiResponseModel<bool>((int)HttpStatusCode.OK, SuccessMessage.Success, true);
            }
            else if(model!=null&& model.RoleId==0)
            {
                var RoleDto = _mapper.Map<Role>(model);
                 RoleDto.CreatedBy = UserEmailId!;
                model.RoleId = await _unitOfWork.RolePermissionRepository.CreateRoleName(RoleDto);
                await _unitOfWork.RolePermissionRepository.SaveRolePermission(model.RoleId, model.PermissionList);
                //email for new role added 
                var createdOn = DateTime.Now;
                await _email.NewRoleAddedAsync(model.RoleName, createdOn);
                return new ApiResponseModel<bool>((int)HttpStatusCode.OK, SuccessMessage.Success, true);
            }
            else
            {
                return new ApiResponseModel<bool>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, false);
            }
        }
        public async Task<ApiResponseModel<List<ModuleDto>>> GetPermissionList()
        {
            var permissionList = await _unitOfWork.RolePermissionRepository.GetPermissionList();

            if (permissionList != null && permissionList.Any() )
            {
                foreach (var permission in permissionList)
                {
                    permission.Permissions = permission.PermissionJson != null ? JsonSerializer.Deserialize<List<PermissionDto>>(permission.PermissionJson) : permission.Permissions;

                }
                var permissionListDto = _mapper.Map<List<ModuleDto>>(permissionList);
                return new ApiResponseModel<List<ModuleDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, permissionListDto);
            }
            else
            {
                return new ApiResponseModel<List<ModuleDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }
        public async Task<ApiResponseModel<IEnumerable<RolesListResponseDto>>> GetRolesList()
        {
            var rolesList = await _unitOfWork.RolePermissionRepository.GetRoles();

            if (rolesList != null)
            {
                return new ApiResponseModel<IEnumerable<RolesListResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, rolesList);
            }
            else
            {
                return new ApiResponseModel<IEnumerable<RolesListResponseDto>>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }

    }
}
