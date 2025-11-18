using System.Net;
using AutoMapper;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models.UserGuide;
using Microsoft.AspNetCore.Http;

namespace HRMS.Application.Services
{
    public class UserGuideService : TokenService, IUserGuideService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public UserGuideService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }


        public async Task<ApiResponseModel<CrudResult>> AddUserGuideAsync(AddUserGuide createDto)
        {
            var existingUserGuide = await _unitOfWork.UserGuideRepository.GetUserGuideByMenuIdAsync(createDto.MenuId);
            if (existingUserGuide != null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.AlreadyExist, CrudResult.Failed);
            }
            if (createDto == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }

            var userGuideEntity = _mapper.Map<UserGuide>(createDto);

            userGuideEntity.CreatedBy = UserEmailId!;
            userGuideEntity.CreatedOn = DateTime.UtcNow;


            await _unitOfWork.UserGuideRepository.AddUserGuideAsync(userGuideEntity);

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Created, SuccessMessage.Success, CrudResult.Success);
        }


        public async Task<ApiResponseModel<IEnumerable<MenuResponseDto>>> GetAllMenuName()
        {
            var menu = await _unitOfWork.UserGuideRepository.GetAllMenuNameAsync();

            if (menu == null || !menu.Any())
            {
                return new ApiResponseModel<IEnumerable<MenuResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }

            return new ApiResponseModel<IEnumerable<MenuResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, menu);
        }


        public async Task<ApiResponseModel<UserGuideResponseListDto>> GetAllUserGuideAsync(SearchRequestDto<GetAllUserGuideRequestDto> searchRequest)
        {
            var UserGuideList = await _unitOfWork.UserGuideRepository.GetAllUserGuideAsync(searchRequest);

            if (UserGuideList == null)
            {
                return new ApiResponseModel<UserGuideResponseListDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
            return new ApiResponseModel<UserGuideResponseListDto>((int)HttpStatusCode.OK, SuccessMessage.Success, UserGuideList);
        }



        public async Task<ApiResponseModel<CrudResult>> UpdateUserGuideAsync(UpdateUserGuide updateDto)
        {
            if (updateDto == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }

            var userGuideEntity = _mapper.Map<UserGuide>(updateDto);

            userGuideEntity.ModifiedBy = UserEmailId!;
            userGuideEntity.ModifiedOn = DateTime.UtcNow;


            await _unitOfWork.UserGuideRepository.UpdateUserGuideAsync(userGuideEntity);

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Created, SuccessMessage.Success, CrudResult.Success);
        }

        public async Task<ApiResponseModel<UserGuideByMenuIdDto>> GetUserGuideByMenuId(long MenuId)
        {
            var UserGuide = await _unitOfWork.UserGuideRepository.GetUserGuideByMenuIdAsync(MenuId);

            if (UserGuide == null)
            {
                return new ApiResponseModel<UserGuideByMenuIdDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
            return new ApiResponseModel<UserGuideByMenuIdDto>((int)HttpStatusCode.OK, SuccessMessage.Success, UserGuide);
        }

        public async Task<ApiResponseModel<UserGuideById>> GetUserGuideById(long Id)
        {
            var UserGuide = await _unitOfWork.UserGuideRepository.GetUserGuideByIdAsync(Id);

            if (UserGuide == null)
            {
                return new ApiResponseModel<UserGuideById>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
            return new ApiResponseModel<UserGuideById>((int)HttpStatusCode.OK, SuccessMessage.Success, UserGuide);
        }

        public async Task<ApiResponseModel<CrudResult>> DeleteUserGuideById(long userGuideId)
        {
            if (userGuideId <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidUserGuideId, CrudResult.Failed);
            }

            var modifiedBy = UserEmailId!;
            var modifiedOn = DateTime.UtcNow;

            var isDeleted = await _unitOfWork.UserGuideRepository.DeleteUserGuideByIdAsync(userGuideId, modifiedBy, modifiedOn);

            if (isDeleted)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.UserGuideDeleted, CrudResult.Success);
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.UserGuideNotFound, CrudResult.Failed);
            }
        }



    }
}