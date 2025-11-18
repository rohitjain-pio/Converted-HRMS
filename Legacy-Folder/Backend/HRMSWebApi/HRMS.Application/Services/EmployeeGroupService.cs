using AutoMapper;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models.EmployeeGroup;
using Microsoft.AspNetCore.Http;
using System.Net;

namespace HRMS.Application.Services
{
    public class EmployeeGroupService : TokenService, IEmployeeGroupService
    {

        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public EmployeeGroupService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }


        public async Task<ApiResponseModel<CrudResult>> Delete(long id)
        {
            var companyPolicyResponse = await _unitOfWork.EmployeeGroupRepository.GetEmployeeGroupById(id);
            if (companyPolicyResponse != null)
            {
                await _unitOfWork.EmployeeGroupRepository.DeleteAsync(id);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<IEnumerable<GroupResponseDto>>> GetEmployeeGroups()
        {
            var groups = await _unitOfWork.EmployeeGroupRepository.GetEmployeeGroups();

            if (groups != null)
            {
                var Employeegroups = _mapper.Map<IEnumerable<GroupResponseDto>>(groups);

                return new ApiResponseModel<IEnumerable<GroupResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, Employeegroups);
            }
            else
            {
                return new ApiResponseModel<IEnumerable<GroupResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }
        public async Task<ApiResponseModel<CrudResult>> CreateGroup(EmployeeGroupRequestDto employeeGroupRequest)
        {
            if (employeeGroupRequest == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            if (await _unitOfWork.EmployeeGroupRepository.GroupNameExistsAsync(employeeGroupRequest.GroupName))
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.GroupNameAlreadyExists, CrudResult.Failed);
            }
            if (await _unitOfWork.EmployeeGroupRepository.ValidateEmployeeIdsAsync(employeeGroupRequest.EmployeeIds))
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.InvalidEmployeeId, CrudResult.Failed);
            }
            Group employeeGroup = _mapper.Map<Group>(employeeGroupRequest);
            employeeGroup.CreatedBy = UserEmailId!;
            int result = await _unitOfWork.EmployeeGroupRepository.CreateGroup(employeeGroup);
            if (result > 0)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.RecordNotAdded, CrudResult.Failed);
        }
        public async Task<ApiResponseModel<CrudResult>> UpdateGroup(EmployeeGroupRequestDto employeeGroupRequest)
        {
            if (employeeGroupRequest == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            if (employeeGroupRequest.Id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, CrudResult.Failed);
            }
            if (!await _unitOfWork.EmployeeGroupRepository.ValidateGroupIdAsync(employeeGroupRequest.Id))
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.GroupIdNotExists, CrudResult.Failed);
            }
            if (await _unitOfWork.EmployeeGroupRepository.ValidateEmployeeIdsAsync(employeeGroupRequest.EmployeeIds))
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.InvalidEmployeeId, CrudResult.Failed);
            }
            var currentGroup = await _unitOfWork.EmployeeGroupRepository.GetEmployeeGroupById(employeeGroupRequest.Id);

            if (!string.Equals(currentGroup?.GroupName, employeeGroupRequest.GroupName, StringComparison.OrdinalIgnoreCase)
                && await _unitOfWork.EmployeeGroupRepository.GroupNameExistsAsync(employeeGroupRequest.GroupName))
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.GroupNameAlreadyExists, CrudResult.Failed);
            }
            Group employeeGroup = _mapper.Map<Group>(employeeGroupRequest);
            employeeGroup.CreatedBy = UserEmailId!;
            int result = await _unitOfWork.EmployeeGroupRepository.UpdateGroup(employeeGroup);
            if (result > 0)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.RecordNotUpdated, CrudResult.Failed);
        }
        public async Task<ApiResponseModel<IEnumerable<EmployeeDto>>> GetAllEmployees()
        {
            var employees = await _unitOfWork.EmployeeGroupRepository.GetAllEmployees();
            if (employees == null || !employees.Any())
            {
                return new ApiResponseModel<IEnumerable<EmployeeDto>>((int)HttpStatusCode.OK, ErrorMessage.NoEmployeeFound, null);
            }
            return new ApiResponseModel<IEnumerable<EmployeeDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, employees);

        }
        public async Task<ApiResponseModel<EmployeeGroupResponseDto>> GetEmployeeGroupDetailsById(long id)
        {
            if (id <= 0)
            {
                return new ApiResponseModel<EmployeeGroupResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, null);
            }
            var employeeGroup = await _unitOfWork.EmployeeGroupRepository.GetEmployeeGroupDetailsById(id);
            if (employeeGroup == null)
            {
                return new ApiResponseModel<EmployeeGroupResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NoGroupFound, null);
            }
            return new ApiResponseModel<EmployeeGroupResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, employeeGroup);

        }
        public async Task<ApiResponseModel<EmployeeGroupSearchResponseDto>> GetEmployeeGroupList(SearchRequestDto<EmployeeGroupSearchRequestDto> requestDto)
        {
            var employees = await _unitOfWork.EmployeeGroupRepository.GetEmployeeGroupList(requestDto);

            return new ApiResponseModel<EmployeeGroupSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, employees);
        }
    }
}
