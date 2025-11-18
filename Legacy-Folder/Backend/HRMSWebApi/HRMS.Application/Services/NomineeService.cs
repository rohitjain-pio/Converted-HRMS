using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Models.Models.UserProfile;
using HRMS.Models;
using System.Net;
using AutoMapper;
using HRMS.Infrastructure;
using Microsoft.AspNetCore.Http;
using HRMS.Application.Clients;
using HRMS.Domain.Configurations;
using Microsoft.Extensions.Options;

namespace HRMS.Application.Services
{
    public class NomineeService : TokenService, INomineeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly AppConfigOptions _appConfig;
        private readonly BlobStorageClient _blobStorageClient;
        public NomineeService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor, IOptions<AppConfigOptions> appConfig, BlobStorageClient blobStorageClient) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _appConfig = appConfig.Value;
            _blobStorageClient = blobStorageClient;
        }
        public async Task<ApiResponseModel<CrudResult>> AddNominee(NomineeRequestDto request)
        {
            if (request.File != null)
            {
                if (request.File.Length > _appConfig.UserDocFileMaxSize)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.InvalidDocMaxSize, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NoFile, CrudResult.Failed);
            }
            var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(request.EmployeeId);
            if (userResponse != null)
            {
                string fileName = await _blobStorageClient.UploadFile(request.File, request.EmployeeId, BlobContainerConstants.UserDocumentContainer);
                if (!string.IsNullOrEmpty(fileName))
                {
                    var userNomineeInfoDto = _mapper.Map<UserNomineeInfo>(request);
                    userNomineeInfoDto.FileName = fileName;
                    userNomineeInfoDto.FileOriginalName = request.File.FileName;
                    userNomineeInfoDto.CreatedOn = DateTime.UtcNow;
                    userNomineeInfoDto.CreatedBy = UserEmailId!;
                    userNomineeInfoDto.IsNomineeMinor = (request.Age < 18);
                    if (!await _unitOfWork.NomineeRepository.ValidatePercentage(userNomineeInfoDto))
                    {
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.ExceedPercentage, CrudResult.Failed);
                    }

                    var response = await _unitOfWork.NomineeRepository.AddNominee(userNomineeInfoDto);
                    if (response > 0)
                    {
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                    }
                    else
                    {
                        await _blobStorageClient.DeleteFile(fileName, BlobContainerConstants.UserDocumentContainer);
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorDocumentInfoInDB, CrudResult.Failed);
                    }
                }
                else
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorUploadFileOnBlob, CrudResult.Failed);

                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.UserNotExist, CrudResult.Failed);
            }
        }
        public async Task<ApiResponseModel<CrudResult>> UpdateNominee(NomineeRequestDto request)
        {
            if (request == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            if (request.Id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, CrudResult.Failed);
            }
            if (!await _unitOfWork.NomineeRepository.ValidateNomineeIdAsync(request.Id))
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.NomineeNotExists, CrudResult.Failed);
            }
            if (!await _unitOfWork.UserProfileRepository.ValidateEmployeeIdAsync(request.EmployeeId))
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.InvalidEmployeeId, CrudResult.Failed);
            }
            var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(request.EmployeeId);
            if (userResponse != null)
            {
                var userNomineeInfo = _mapper.Map<UserNomineeInfo>(request);
                userNomineeInfo.IsNomineeMinor = (request.Age < 18);
                userNomineeInfo.ModifiedBy = UserEmailId;
                var nominee = await _unitOfWork.NomineeRepository.GetNomineeById(request.Id.Value);
                
                if (nominee != null && nominee.Percentage != request.Percentage && !await _unitOfWork.NomineeRepository.ValidateUpdatePercentage(userNomineeInfo))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.ExceedPercentage, CrudResult.Failed);
                }

                if (request.File != null && request.File.Length > _appConfig.UserDocFileMaxSize)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidDocMaxSize, CrudResult.Failed);
                }
                if (request.File != null)
                {
                    string fileName = await _blobStorageClient.UploadFile(request.File, request.EmployeeId, BlobContainerConstants.UserDocumentContainer);
                    if (!string.IsNullOrEmpty(fileName))
                    {
                        userNomineeInfo.FileName = fileName;
                        userNomineeInfo.FileOriginalName = request.File.FileName;
                    }
                    else
                    {
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorUploadFileOnBlob, CrudResult.Failed);
                    }
                }
                var response = await _unitOfWork.NomineeRepository.UpdateNominee(userNomineeInfo);
                if (response > 0)
                {
                    if (!string.IsNullOrWhiteSpace(nominee!.FileName) && !string.IsNullOrWhiteSpace(userNomineeInfo.FileName))
                    {
                        await _blobStorageClient.DeleteFile(nominee.FileName, BlobContainerConstants.UserDocumentContainer);
                    }
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                else
                {
                    await _blobStorageClient.DeleteFile(userNomineeInfo.FileName, BlobContainerConstants.UserDocumentContainer);
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorDocumentInfoInDB, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.UserNotExist, CrudResult.Failed);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> DeleteNominee(long id)
        {
            if (id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, CrudResult.Failed);
            }
            var nominee = await _unitOfWork.NomineeRepository.GetNomineeById(id);
            if (nominee != null)
            {
                UserNomineeInfo userNominee = new();
                userNominee.ModifiedBy = UserEmailId;
                userNominee.Id = id;
                var sucess = await _unitOfWork.NomineeRepository.DeleteNominee(userNominee);
                if (sucess > 0)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.RecordNotDeleted, CrudResult.Failed);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }
        public async Task<ApiResponseModel<NomineeSearchResponseDto>> GetNomineeList(SearchRequestDto<NomineeSearchRequestDto> requestDto)
        {
            var nomineeList = await _unitOfWork.NomineeRepository.GetNomineeList(requestDto);
            if (nomineeList == null)
            {
                return new ApiResponseModel<NomineeSearchResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
            return new ApiResponseModel<NomineeSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, nomineeList);
        }

        public async Task<ApiResponseModel<NomineeResponseDto>> GetNomineeById(long id)
        {
            if (id <= 0)
            {
                return new ApiResponseModel<NomineeResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, null);
            }
            var nominee = await _unitOfWork.NomineeRepository.GetNomineeById(id);
            if (nominee == null)
            {
                return new ApiResponseModel<NomineeResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
            return new ApiResponseModel<NomineeResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, nominee);

        }
        public async Task<ApiResponseModel<byte[]?>> DownloadNomineeDocument(string containerName, string filename)
        {
            if (!string.IsNullOrEmpty(filename))
            {
                var blob = await _blobStorageClient.DownloadFile(containerName, filename);
                if (blob != null)
                {
                    return new ApiResponseModel<byte[]?>((int)HttpStatusCode.OK, SuccessMessage.Success, blob);
                }
                else
                {
                    return new ApiResponseModel<byte[]?>((int)HttpStatusCode.BadRequest, ErrorMessage.FileNotExist, null);
                }
            }
            else
            {
                return new ApiResponseModel<byte[]?>((int)HttpStatusCode.BadRequest, ErrorMessage.FileNameRequired, null);
            }
        }
    }
}
