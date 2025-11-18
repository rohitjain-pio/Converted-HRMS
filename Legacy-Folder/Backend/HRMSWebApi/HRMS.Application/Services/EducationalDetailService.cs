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
    public class EducationalDetailService : TokenService, IEducationalDetailService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly AppConfigOptions _appConfig;
        private readonly BlobStorageClient _blobStorageClient;

        public EducationalDetailService(IUnitOfWork unitOfWork, IMapper mapper, IOptions<AppConfigOptions> appConfig, BlobStorageClient blobStorageClient, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _appConfig = appConfig.Value;
            _blobStorageClient = blobStorageClient;
        }
        public async Task<ApiResponseModel<CrudResult>> AddEducationalDetails(UserQualificationInfoRequestDto userQualificationRequest)
        {
            if (userQualificationRequest.File != null)
            {
                if (userQualificationRequest.File.Length > _appConfig.UserDocFileMaxSize)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.InvalidDocMaxSize, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NoFile, CrudResult.Failed);
            }
            var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(userQualificationRequest.EmployeeId);
            if (userResponse != null)
            {
                string validateQualificationResponse = ValidateQualification(userQualificationRequest.QualificationId, userQualificationRequest.StartYear, userQualificationRequest.EndYear);
                if (!string.IsNullOrEmpty(validateQualificationResponse))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, validateQualificationResponse, CrudResult.Failed);
                }
                bool isEducationExist = false;
                if (userQualificationRequest.QualificationId == (long)QualificationType.HSC
                    || userQualificationRequest.QualificationId == (long)QualificationType.SSC
                    || userQualificationRequest.QualificationId == (long)QualificationType.Diploma
                    || userQualificationRequest.QualificationId == (long)QualificationType.Graduation)
                {
                    isEducationExist = await _unitOfWork.EducationalDetailRepository.CheckEmployeeQualificationExist(userQualificationRequest.EmployeeId, userQualificationRequest.QualificationId, 0);
                }
                if (isEducationExist)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.QualificationExist, CrudResult.Failed);
                }
                else
                {
                    string fileName = await _blobStorageClient.UploadFile(userQualificationRequest.File, userQualificationRequest.EmployeeId, BlobContainerConstants.UserDocumentContainer);
                    if (!string.IsNullOrEmpty(fileName))
                    {
                        var userEducationDetails = _mapper.Map<UserQualificationInfo>(userQualificationRequest);
                        userEducationDetails.FileName = fileName;
                        userEducationDetails.FileOriginalName = userQualificationRequest.File.FileName;
                        userEducationDetails.CreatedOn = DateTime.UtcNow;
                        userEducationDetails.CreatedBy = UserEmailId!;

                        var response = await _unitOfWork.EducationalDetailRepository.AddAsync(userEducationDetails);
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
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.UserNotExist, CrudResult.Failed);
            }
        }

        public async Task<ApiResponseModel<EduDocResponseDto>> GetEducationalDetailsById(long id)
        {
            var response = await _unitOfWork.EducationalDetailRepository.GetEducationalDetailsById(id);
            if (response != null)
            {

                return new ApiResponseModel<EduDocResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<EduDocResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<UserQualificationResponseDto>> DeleteEducationalDetails(long id)
        {
            var EducationalDetailsResponse = await _unitOfWork.EducationalDetailRepository.GetEducationalDetailsById(id);
            if (EducationalDetailsResponse != null)
            {
                await _unitOfWork.EducationalDetailRepository.DeleteEducationalDetails(id);
                return new ApiResponseModel<UserQualificationResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, null);
            }
            return new ApiResponseModel<UserQualificationResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
        }

        public async Task<ApiResponseModel<EduDocSearchResponseDto>> GetEducationalDocuments(SearchRequestDto<EduDocSearchRequestDto> requestDto)
        {
            var eduDocList = await _unitOfWork.EducationalDetailRepository.GetEducationalDocuments(requestDto);
            if (eduDocList != null && eduDocList.EduDocResponseList.Any())
            {
                return new ApiResponseModel<EduDocSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, eduDocList);
            }
            else
            {
                return new ApiResponseModel<EduDocSearchResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> EditEducationalDetails(UserQualificationInfoRequestDto userQualificationRequest)
        {
            if (userQualificationRequest.File != null && userQualificationRequest.File.Length > _appConfig.UserDocFileMaxSize)
            {    
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.InvalidDocMaxSize, CrudResult.Failed);
            }

            var userEducationalDetailResponse = await _unitOfWork.EducationalDetailRepository.GetEducationalDetailsById(userQualificationRequest.Id);
            if (userEducationalDetailResponse != null)
            {
                string fileName =string.Empty;
                string validateQualificationResponse = ValidateQualification(userQualificationRequest.QualificationId, userQualificationRequest.StartYear, userQualificationRequest.EndYear);
                if (!string.IsNullOrEmpty(validateQualificationResponse))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, validateQualificationResponse, CrudResult.Failed);
                }
                bool isEducationExist = false;
                if ((userQualificationRequest.QualificationId == (long)QualificationType.HSC
                    || userQualificationRequest.QualificationId == (long)QualificationType.SSC
                    || userQualificationRequest.QualificationId == (long)QualificationType.Diploma
                    || userQualificationRequest.QualificationId == (long)QualificationType.Graduation)
                        && userQualificationRequest.QualificationId != userEducationalDetailResponse.QualificationId)
                {
                    isEducationExist = await _unitOfWork.EducationalDetailRepository.CheckEmployeeQualificationExist(userQualificationRequest.EmployeeId, userQualificationRequest.QualificationId, userQualificationRequest.Id);
                }

                if (isEducationExist)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.QualificationExist, CrudResult.Failed);
                }

                var userEducationDetails = _mapper.Map<UserQualificationInfo>(userQualificationRequest);
                if (userQualificationRequest.File != null)
                {
                    fileName = await _blobStorageClient.UploadFile(userQualificationRequest.File, userQualificationRequest.EmployeeId, BlobContainerConstants.UserDocumentContainer);
                    userEducationDetails.FileName = fileName;
                    userEducationDetails.FileOriginalName = userQualificationRequest.File.FileName;
                }
                userEducationDetails.Id = userQualificationRequest.Id;
                userEducationDetails.ModifiedOn = DateTime.UtcNow;
                userEducationDetails.ModifiedBy = UserEmailId;

                var response = await _unitOfWork.EducationalDetailRepository.UpdateAsync(userEducationDetails);
                if (response > 0)
                {
                    if (!string.IsNullOrWhiteSpace(userEducationDetails!.FileName) && !string.IsNullOrWhiteSpace(userEducationalDetailResponse!.FileName))
                    {
                        await _blobStorageClient.DeleteFile(userEducationalDetailResponse!.FileName, BlobContainerConstants.UserDocumentContainer);
                    }
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                else
                {
                    await _blobStorageClient.DeleteFile(userEducationDetails!.FileName, BlobContainerConstants.UserDocumentContainer);
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorDocumentInfoInDB, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.InvalidQualification, CrudResult.Failed);
            }
        }

        private static string ValidateQualification(long qualificationId, string startYear, string endYear)
        {
            DateTime startYearDate = Convert.ToDateTime(startYear);
            DateTime endYearDate = Convert.ToDateTime(endYear);
            TimeSpan diffResult = endYearDate.Subtract(startYearDate);
            int years = new DateTime(diffResult.Ticks,DateTimeKind.Utc).Year - 1;

            if ((qualificationId == (long)QualificationType.HSC || qualificationId == (long)QualificationType.SSC) && years < 1)
            {
                return ErrorMessage.AtLeastOneYearGapRequired;
            }
            else if ((qualificationId == (long)QualificationType.Diploma || qualificationId == (long)QualificationType.Graduation
                             || qualificationId == (long)QualificationType.PostGraduation) && years < 2)
            {
                return ErrorMessage.AtLeastTwoYearGapRequired;
            }
            else if (qualificationId > 5)
            {
                return ErrorMessage.InvalidQualification;
            }
            return "";
        }
    }
}