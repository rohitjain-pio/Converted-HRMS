using AutoMapper;
using HRMS.Application.Clients;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Configurations;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Net;

namespace HRMS.Application.Services
{
    public class CertificateService : TokenService, ICertificateService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly AppConfigOptions _appConfig;
        private readonly BlobStorageClient _blobStorageClient;

        public CertificateService(IUnitOfWork unitOfWork, IMapper mapper, IOptions<AppConfigOptions> appConfig, BlobStorageClient blobStorageClient, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _appConfig = appConfig.Value;
            _blobStorageClient = blobStorageClient;
        }

        public async Task<ApiResponseModel<CrudResult>> ArchiveUnarchiveUserCertificate(EmployeeArchiveRequestDto employeeArchiveRequestDto)
        {
            var userCertificateResponse = await _unitOfWork.CertificateRepository.GetUserCertificateByIdAsync(employeeArchiveRequestDto.Id);
            if (userCertificateResponse != null)
            {
                await _unitOfWork.CertificateRepository.ArchiveUnarchiveUserCertificate(employeeArchiveRequestDto);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<CrudResult>> UploadEmployeeCertificate(UserCertificateRequestDto userCertificateRequestDto)
        {
            if (await _unitOfWork.CertificateRepository.CertificateNameExistsAsync(userCertificateRequestDto))
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.CertificateNameAlreadyExists, CrudResult.Failed);
            }
            if (userCertificateRequestDto.File != null)
            {
                if (userCertificateRequestDto.File.Length > _appConfig.UserDocFileMaxSize)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.InvalidDocMaxSize, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NoFile, CrudResult.Failed);
            }
            var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(userCertificateRequestDto.EmployeeId);
            if (userResponse != null)
            {
                string fileName = await _blobStorageClient.UploadFile(userCertificateRequestDto.File, userCertificateRequestDto.EmployeeId, BlobContainerConstants.UserDocumentContainer);
                if (!string.IsNullOrEmpty(fileName))
                {
                    var userCertificateDto = _mapper.Map<UserCertificate>(userCertificateRequestDto);
                    userCertificateDto.FileName = fileName;
                    userCertificateDto.OriginalFileName = userCertificateRequestDto.File.FileName;
                    userCertificateDto.CreatedOn = DateTime.UtcNow;
                    userCertificateDto.CreatedBy = UserEmailId!;

                    var response = await _unitOfWork.CertificateRepository.AddAsync(userCertificateDto);
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

        public async Task<ApiResponseModel<CrudResult>> UpdateUploadEmployeeCertificate(UserCertificateRequestDto userCertificateRequestDto)
        {
            if (await _unitOfWork.CertificateRepository.CertificateNameExistsAsync(userCertificateRequestDto))
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.CertificateNameAlreadyExists, CrudResult.Failed);
            }
            if (userCertificateRequestDto.File != null && userCertificateRequestDto.File.Length > _appConfig.UserDocFileMaxSize)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidDocMaxSize, CrudResult.Failed);
            }

            var userCertificateResponse = await _unitOfWork.CertificateRepository.GetUserCertificateByIdAsync(userCertificateRequestDto.Id);
            var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(userCertificateRequestDto.EmployeeId);
            if (userResponse == null || userCertificateResponse == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.UserNotExist, CrudResult.Failed);
            }

            var userCertificateDto = _mapper.Map<UserCertificate>(userCertificateRequestDto);
            userCertificateDto.ModifiedOn = DateTime.UtcNow;
            userCertificateDto.ModifiedBy = UserEmailId!;
            if (userCertificateRequestDto.File != null)
            {
                string fileName = await _blobStorageClient.UploadFile(userCertificateRequestDto.File, userCertificateRequestDto.EmployeeId, BlobContainerConstants.UserDocumentContainer);
                if (string.IsNullOrEmpty(fileName))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorUploadFileOnBlob, CrudResult.Failed);
                }
                userCertificateDto.FileName = fileName;
                userCertificateDto.OriginalFileName = userCertificateRequestDto.File.FileName;
            }

            var response = await _unitOfWork.CertificateRepository.UpdateAsync(userCertificateDto);
            if (response > 0)
            {
                if (!string.IsNullOrWhiteSpace(userCertificateDto!.FileName) && !string.IsNullOrWhiteSpace(userCertificateResponse.FileName))
                {
                    await _blobStorageClient.DeleteFile(userCertificateResponse.FileName, BlobContainerConstants.UserDocumentContainer);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            else
            {
                await _blobStorageClient.DeleteFile(userCertificateResponse.FileName, BlobContainerConstants.UserDocumentContainer);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorDocumentInfoInDB, CrudResult.Failed);
            }
        }

        public async Task<ApiResponseModel<UserCertificateSearchResponseDto>> GetEmployeeCerificateList(SearchRequestDto<UserCertificateSearchRequestDto> requestDto)
        {
            var userCertificateResponse = await _unitOfWork.CertificateRepository.GetEmployeeCertificates(requestDto);
            if (userCertificateResponse == null)
            {
                return new ApiResponseModel<UserCertificateSearchResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }

            return new ApiResponseModel<UserCertificateSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, userCertificateResponse);
        }

        public async Task<ApiResponseModel<UserCertificateResponseDto>> GetUserCertificateById(long id)
        {
            var response = await _unitOfWork.CertificateRepository.GetUserCertificateByIdAsync(id);
            if (response != null)
            {
                return new ApiResponseModel<UserCertificateResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<UserCertificateResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<byte[]?>> DownloadCertificateDocument(string containerName, string filename)
        {
            if (string.IsNullOrWhiteSpace(filename))
            {
                return new ApiResponseModel<byte[]?>((int)HttpStatusCode.BadRequest, ErrorMessage.FileNameRequired, null);
            }

            var blob = await _blobStorageClient.DownloadFile(containerName, filename);
            if (blob == null)
            {
                return new ApiResponseModel<byte[]?>((int)HttpStatusCode.BadRequest, ErrorMessage.FileNotExist, null);  
            }
            
            return new ApiResponseModel<byte[]?>((int)HttpStatusCode.OK, SuccessMessage.Success, blob);
        }
    }
}