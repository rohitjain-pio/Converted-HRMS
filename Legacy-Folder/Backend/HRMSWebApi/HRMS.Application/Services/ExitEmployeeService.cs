using HRMS.Domain.Entities;
using HRMS.Models.Models.UserProfile;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Configurations;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Models;
using System.Net;
using AutoMapper;
using HRMS.Infrastructure;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using HRMS.Models.Models.Employees;

namespace HRMS.Application.Services
{
    public class ExitEmployeeService : TokenService,IExitEmployeeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly JobTypeOptions _jobTypeOptions;
        IEmailNotificationService _email;

        public ExitEmployeeService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor, IOptions<JobTypeOptions> jobTypeOptions, IEmailNotificationService email)  : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _jobTypeOptions = jobTypeOptions.Value;
            _email = email;
        }
        public async Task<ApiResponseModel<CrudResult>> AddResignation(ResignationRequestDto request)
        {

            var resignationDetails = await _unitOfWork.ExitEmployeeRepository.GetEmployeeDetailsForResignationAsync(request.EmployeeId);
            var resignationById = await _unitOfWork.ExitEmployeeRepository.GetResignationByAsync(request.EmployeeId);
            if (resignationById != null && (resignationById.Status == ResignationStatus.Accepted || resignationById.Status == ResignationStatus.Pending))
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.ResignationExist, CrudResult.Failed);
            }
            var resignationDto = _mapper.Map<Resignation>(request);
            resignationDto.CreatedBy = UserEmailId!;
            resignationDto.JobType = resignationDetails.JobType;
            resignationDto.CreatedOn = DateTime.UtcNow;
            resignationDto.IsActive = true;

            int jobDuration = 0;
            if (resignationDetails.JobType == JobType.Probation)
            {
                jobDuration = _jobTypeOptions.Probation;
            }
            else if (resignationDetails.JobType == JobType.Training)
            {
                jobDuration = _jobTypeOptions.Training;
            }
            else if (resignationDetails.JobType == JobType.Confirmed)
            {
                jobDuration = _jobTypeOptions.Confirmed;
            }
            if (resignationDetails.JobType == JobType.Probation || resignationDetails.JobType == JobType.Training)
            {
                resignationDto.LastWorkingDay = DateOnly.FromDateTime(resignationDto.CreatedOn.AddDays(jobDuration));
            }
            else if (resignationDetails.JobType == JobType.Confirmed)
            {
                resignationDto.LastWorkingDay = DateOnly.FromDateTime(resignationDto.CreatedOn.AddMonths(jobDuration));
            }
            await _unitOfWork.ExitEmployeeRepository.AddResignationAsync(resignationDto);
            await _email.ResignationSubmitted(request.EmployeeId);
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.AddedResignation, CrudResult.Success);
        }
        public async Task<ApiResponseModel<ResignationResponseDto>> GetResignationById(int id)
        {
            var response = await _unitOfWork.ExitEmployeeRepository.GetEmployeeDetailsForResignationAsync(id);

            if (response != null)
            {
                return new ApiResponseModel<ResignationResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<ResignationResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }
        public async Task<ApiResponseModel<ResignationExistResponseDto>> GetResignationExitData(int id)
        {
            var response = await _unitOfWork.ExitEmployeeRepository.GetResignationExistAsync(id);

            if (response != null)
            { 
                return new ApiResponseModel<ResignationExistResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<ResignationExistResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> RevokeResignation(int resignationId)
        {
            var resignation = await _unitOfWork.ExitEmployeeRepository.GetResignationByIdAsync(resignationId);

            if (resignation == null)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.ResignationRevokeFailed, CrudResult.Failed);

            if (resignation.ResignationStatus == ResignationStatus.Revoked)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.ResignationAlreadyRevoked, CrudResult.Failed);

            resignation.ResignationStatus = ResignationStatus.Revoked;
            resignation.ModifiedBy = UserEmailId!;
            resignation.ModifiedOn = DateTime.UtcNow;

            var updated = await _unitOfWork.ExitEmployeeRepository.UpdateResignationAsync(resignation);

            if (!updated)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ResignationRevokeFailed, CrudResult.Failed);
            }

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.ResignationRevoked, CrudResult.Success);
        }
        
         public async Task<ApiResponseModel<CrudResult>> RequestEarlyReleaseAsync(EarlyReleaseRequestDto request)
        {
            var resignation = await _unitOfWork.ExitEmployeeRepository.GetResignationByIdAsync(request.ResignationId);
            request.CreatedBy = UserEmailId!;
            request.EarlyReleaseStatus = EarlyReleaseStatus.Pending;
            var historyDto = new ResignationHistory
            {
                ResignationId = request.ResignationId,
                CreatedOn = DateTime.UtcNow,
                CreatedBy = request.CreatedBy,
                ResignationStatus = resignation.ResignationStatus,
                EarlyReleaseStatus = resignation.EarlyReleaseStatus
            };
            var updated = await _unitOfWork.ExitEmployeeRepository.RequestEarlyReleaseAsync(request, historyDto);

            if (!updated)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ResignationEarlyReleaseFailed, CrudResult.Failed);
            }
            await _email.EarlyReleaseRequested(request.ResignationId);
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.ResignationEarlyReleaseSuccess, CrudResult.Success);
        }

        public async Task<ApiResponseModel<IsResignationExistResponseDTO?>> IsResignationExist(int id)
        {

            IsResignationExistResponseDTO? response = await _unitOfWork.ExitEmployeeRepository.IsResignationExistAsync(id);

            return new ApiResponseModel<IsResignationExistResponseDTO?>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
          
        }

    }
}
