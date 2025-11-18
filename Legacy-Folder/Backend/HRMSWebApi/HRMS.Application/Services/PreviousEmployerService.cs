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
    public class PreviousEmployerService : TokenService,IPreviousEmployerService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly AppConfigOptions _appConfig;
        private readonly BlobStorageClient _blobStorageClient;

        public PreviousEmployerService(IUnitOfWork unitOfWork, IMapper mapper, IOptions<AppConfigOptions> appConfig, BlobStorageClient blobStorageClient, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _appConfig = appConfig.Value;
            _blobStorageClient = blobStorageClient;
        }

        public async Task<ApiResponseModel<long>> AddPreviousEmployer(PreviousEmployerRequestDto request)
        {
            long employerId = 0;
            if (request == null)
            {
                return new ApiResponseModel<long>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, employerId);
            }

            var previousEmployerDetail = _mapper.Map<PreviousEmployer>(request);
            previousEmployerDetail.CreatedBy = UserEmailId!;
            previousEmployerDetail.CreatedOn = DateTime.UtcNow;

            employerId = await _unitOfWork.PreviousEmployerRepository.AddAsync(previousEmployerDetail);

            return new ApiResponseModel<long>((int)HttpStatusCode.OK, SuccessMessage.EmployerAdded, employerId);
        }

        public async Task<ApiResponseModel<PreviousEmployerSearchResponseDto>> GetPreviousEmployerList(SearchRequestDto<PreviousEmployerSearchRequestDto> requestDto)
        {
            var previousEmployer = requestDto.Filters;
            if (string.IsNullOrEmpty(previousEmployer.DocumentName))
                previousEmployer.DocumentName = null;

            var previousEmployerResponse = await _unitOfWork.PreviousEmployerRepository.GetPreviousEmployerList(requestDto);
            if (previousEmployerResponse == null)
            {
                return new ApiResponseModel<PreviousEmployerSearchResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
            return new ApiResponseModel<PreviousEmployerSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, previousEmployerResponse);
        }

        public async Task<ApiResponseModel<CrudResult>> DeletePreviousEmployer(long id)
        {
            if (id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, CrudResult.Failed);
            }
            var IsPreviousEmployerExist = await _unitOfWork.PreviousEmployerRepository.GetByIdAsync(id);
            if (IsPreviousEmployerExist != null)
            {
                PreviousEmployer previousEmployer = new();
                previousEmployer.ModifiedBy = UserEmailId;
                previousEmployer.Id = id;
                var sucess = await _unitOfWork.PreviousEmployerRepository.DeleteAsync(previousEmployer);
                if (sucess > 0)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.RecordNotDeleted, CrudResult.Failed);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<CrudResult>> UploadPreviousEmployerDocument(PreviousEmployerDocRequestDto employerDocRequestDto)
        {
            if (employerDocRequestDto.File != null)
            {
                if (employerDocRequestDto.File.Length > _appConfig.UserDocFileMaxSize)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidDocMaxSize, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NoFile, CrudResult.Failed);
            }
            var employerResponse = await _unitOfWork.UserProfileRepository.GetEmployerDetailIdAsync(employerDocRequestDto.PreviousEmployerId);
            var IsDocumentTypeAlreadyUploaded = await _unitOfWork.PreviousEmployerRepository.GetPreviousEmployerDocument(employerDocRequestDto.PreviousEmployerId, employerDocRequestDto.EmployerDocumentTypeId);
            if (IsDocumentTypeAlreadyUploaded)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.DocumentAlreadyUploaded, CrudResult.Failed);
            }
            if (employerResponse != null && employerResponse.Any())
            {
                string fileName = await _blobStorageClient.UploadFile(employerDocRequestDto.File, employerDocRequestDto.PreviousEmployerId, BlobContainerConstants.EmployerDocumentContainer);
                if (!string.IsNullOrEmpty(fileName))
                {
                    var previousEmployer = _mapper.Map<PreviousEmployerDocument>(employerDocRequestDto);
                    previousEmployer.FileName = fileName;
                    previousEmployer.FileOriginalName = employerDocRequestDto.File.FileName;
                    previousEmployer.CreatedOn = DateTime.UtcNow;
                    previousEmployer.CreatedBy = UserEmailId!;
                    var response = await _unitOfWork.PreviousEmployerRepository.UploadPreviousEmployerDocumentAsync(previousEmployer);
                    if (response > 0)
                    {
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                    }
                    else
                    {
                        await _blobStorageClient.DeleteFile(fileName, BlobContainerConstants.EmployerDocumentContainer);
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
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.EmployerNotExist, CrudResult.Failed);
            }
        }
        public async Task<ApiResponseModel<PreviousEmployerResponseDto>> GetPreviousEmployerById(long id)
        {
            if (id <= 0)
            {
                return new ApiResponseModel<PreviousEmployerResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, null);
            }
            PreviousEmployer? previousEmployer  = await _unitOfWork.PreviousEmployerRepository.GetByIdAsync(id);
            PreviousEmployerResponseDto responseDtos = _mapper.Map<PreviousEmployerResponseDto >(previousEmployer);
            if (responseDtos != null)
            {  
                    return new ApiResponseModel<PreviousEmployerResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, responseDtos);
                 
            }
            return new ApiResponseModel<PreviousEmployerResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
        }
        public async Task<ApiResponseModel<CrudResult>> UpdatePreviousEmployer(PreviousEmployerRequestDto request)
        { 
            if (request == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            else
            {
                PreviousEmployer? previousEmployer = await _unitOfWork.PreviousEmployerRepository.GetByIdAsync(request.Id);
                if (previousEmployer != null)
                { 
                    var previousEmployerDetail = _mapper.Map<PreviousEmployer>(request);
                    previousEmployerDetail.ModifiedBy = UserEmailId!;  
                    previousEmployerDetail.ModifiedOn = DateTime.UtcNow;  
                      await _unitOfWork.PreviousEmployerRepository.UpdateAsync(previousEmployerDetail);

                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.EmployerUpdated, CrudResult.Success);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            } 
        }

        public async Task<ApiResponseModel<CrudResult>> DeletePreviousEmployerDocument(long id)
        {
            if (id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, CrudResult.Failed);
            }

            var IsPreviousEmployerDocumentExist = await _unitOfWork.PreviousEmployerRepository.GetPreviousEmployerDocumentByIdAsync(id);
            if (IsPreviousEmployerDocumentExist != null)
            {
                PreviousEmployerDocument previousEmployerDocument = new();
                previousEmployerDocument.ModifiedBy = UserEmailId;
                previousEmployerDocument.Id = id;
                var sucess = await _unitOfWork.PreviousEmployerRepository.DeletePreviousEmployerDocumentAsync(previousEmployerDocument);
                if (sucess > 0)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.RecordNotDeleted, CrudResult.Failed);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }
    }
}