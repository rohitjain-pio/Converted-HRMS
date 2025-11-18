using AutoMapper;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Configurations;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Domain.Utility;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models.CompanyPolicy;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Net;

namespace HRMS.Application.Services
{
    public class CompanyPolicyService : TokenService, ICompanyPolicyService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly FilePathOptions _filePathOptions;
        private readonly List<string> _AllowedFileExtensions = new List<string>() { ".pdf", ".doc", ".docx", ".jpeg", ".jpg", ".png" };
        private readonly IHostingEnvironment _environment;
        private readonly AppConfigOptions _appConfig;
        private readonly IEmailNotificationService _email;
        public CompanyPolicyService(IUnitOfWork unitOfWork, IMapper mapper, IOptions<AppConfigOptions> appConfig, IOptions<FilePathOptions> filePathOptions, IHostingEnvironment environment, IHttpContextAccessor httpContextAccessor, IEmailNotificationService email) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _filePathOptions = filePathOptions.Value;
            _environment = environment;
            _appConfig = appConfig.Value;
            _email = email;
        }

        public async Task<ApiResponseModel<CompanyPolicyResponseDto>> Add(CompanyPolicyRequestDto companyPolicyRequestDto)
        {

            bool isDocSaved = true;
            CompanyPolicy companyPolicy = new();
            if (companyPolicyRequestDto.FileContent != null)
            {
                string fileName = Path.GetFileNameWithoutExtension(companyPolicyRequestDto.FileContent.FileName);
                string fileExtension = Path.GetExtension(companyPolicyRequestDto.FileContent.FileName);
                if (!string.IsNullOrEmpty(fileExtension) && _AllowedFileExtensions.Contains(fileExtension.ToLower()))
                {
                    companyPolicy.FileName = fileName + "_" + DateTime.UtcNow.ToString("ddMMyyyyHHmmss") + fileExtension;
                    companyPolicy.FileOriginalName = companyPolicyRequestDto.FileContent.FileName;
                    if (companyPolicyRequestDto.FileContent.Length < _appConfig.PolicyDocumentMaxSize)
                    {
                        isDocSaved = await CreatePolicyDocument(companyPolicyRequestDto.FileContent, companyPolicy.FileName);
                    }
                    else
                    {
                        return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidPolicyMaxSize, null);
                    }
                }
                else
                {

                    return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.FileTypeIsNotSupport, null);
                }
            }
            else
            {
                return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.CompanyPolicyDocRequered, null);
            }

            if (isDocSaved)
            {
                companyPolicy.Name = companyPolicyRequestDto.Name;
                companyPolicy.DocumentCategoryId = companyPolicyRequestDto.DocumentCategoryId;
                companyPolicy.StatusId = companyPolicyRequestDto.StatusId;
                companyPolicy.Accessibility = companyPolicyRequestDto.Accessibility;
                companyPolicy.Description = companyPolicyRequestDto.Description;
                companyPolicy.CreatedBy = UserEmailId!;
                companyPolicy.CreatedOn = DateTime.UtcNow;
                companyPolicy.EffectiveDate = companyPolicy.StatusId == (int)CompanyPolicyStatus.Draft ? null : DateTime.UtcNow;
                var res = await _unitOfWork.CompanyPolicyRepository.AddAsync(companyPolicy);
                if (res == -1)
                {
                    DeleteDocument(companyPolicy.FileName);
                    return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.ErrorInSavingFile, null);
                }
                if (companyPolicyRequestDto.EmailRequest)
                {
                await _email.UpdatedPolicy(companyPolicyRequestDto.Name, false);
                }
                 companyPolicy.Id = res;
                 companyPolicy.VersionNo = 0;
                await _unitOfWork.CompanyPolicyRepository.AddPolicyHistory(companyPolicy);
                return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.OK, SuccessMessage.AddedCompanyPolicy, null);
            }
            else
            {
                return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.ErrorInSavingFile, null);
            }
        }
        private void DeleteDocument(string fileName)
        {
            var filePath = Path.Combine(this._environment.WebRootPath, _filePathOptions.PolicyDirectoryLocation);
            string fileActualLocation = Path.GetFullPath(filePath + fileName);

            if (fileActualLocation.StartsWith(Path.GetFullPath(filePath), StringComparison.OrdinalIgnoreCase))
            {
                Helper.DeleteFile(fileName, filePath);
            }  
        }
        private async Task<bool> CreatePolicyDocument(IFormFile fileContent, string fileName)
        {
            var filePath = Path.Combine(this._environment.WebRootPath, _filePathOptions.PolicyDirectoryLocation);
            string fileActualLocation = Path.GetFullPath(filePath + fileName);
            if (fileActualLocation.StartsWith(Path.GetFullPath(filePath), StringComparison.OrdinalIgnoreCase))
            {
                if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(filePath);
                }
                using (Stream fileStream = new FileStream(filePath + fileName, FileMode.Create))
                {
                    await fileContent.CopyToAsync(fileStream);
                }
                return true;
            }
            return false;
        }
        public async Task<ApiResponseModel<CompanyPolicyResponseDto>> GetCompanyPolicyById(long id)
        {
            var companyPolicyResponse = await _unitOfWork.CompanyPolicyRepository.GetPolicyDetailByIdAsync(id);
            if (companyPolicyResponse != null)
            {

                return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, companyPolicyResponse);
            }
            else
            {
                return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<CompanyPolicySearchResponseDto>> GetCompanyPolicies(SearchRequestDto<CompanyPolicySearchRequestDto> requestDto)
        {
            var companyPolicySearchList = await _unitOfWork.CompanyPolicyRepository.GetCompanyPolicies(requestDto);
            if (companyPolicySearchList != null && companyPolicySearchList.CompanyPolicyList.Any())
            {
                return new ApiResponseModel<CompanyPolicySearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, companyPolicySearchList);
            }
            else
            {
                return new ApiResponseModel<CompanyPolicySearchResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }
        public async Task<ApiResponseModel<CompanyPolicyResponseDto>> Edit(CompanyPolicyRequestDto companyPolicyRequestDto)
        {

            bool isDocSaved = true;
            bool isUpdatedCompanyPolicy = true;
            var companyPolicyResponse = await _unitOfWork.CompanyPolicyRepository.GetByIdAsync(companyPolicyRequestDto.Id);
            CompanyPolicy companyPolicy = new CompanyPolicy();
            if (companyPolicyResponse != null)
            {
                if (companyPolicyResponse.StatusId == (int)CompanyPolicyStatus.Active)
                {
                    TimeSpan TodayTime = DateTime.UtcNow - companyPolicyResponse.EffectiveDate.Value;
                    // if (TodayTime.TotalHours > _appConfig.PolicyVersionUpdateTime)
                    {
                        isUpdatedCompanyPolicy = false;

                        if (companyPolicyRequestDto.FileContent != null)
                        {
                            string fileName = Path.GetFileNameWithoutExtension(companyPolicyRequestDto.FileContent.FileName);
                            string fileExtension = Path.GetExtension(companyPolicyRequestDto.FileContent.FileName);
                            if (!string.IsNullOrEmpty(fileExtension) && _AllowedFileExtensions.Contains(fileExtension.ToLower()))
                            {
                                companyPolicy.FileName = fileName + "_" + DateTime.UtcNow.ToString("ddMMyyyyHHmmss") + fileExtension;
                                companyPolicy.FileOriginalName = companyPolicyRequestDto.FileContent.FileName;
                                if (companyPolicyRequestDto.FileContent.Length < _appConfig.PolicyDocumentMaxSize)
                                {
                                    isDocSaved = await CreatePolicyDocument(companyPolicyRequestDto.FileContent, companyPolicy.FileName);

                                }
                                else
                                {
                                    return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidPolicyMaxSize, null);
                                }

                            }
                            else
                            {
                                return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.FileTypeIsNotSupport, null);

                            }
                        }
                        else
                        {
                            var fileData = await _unitOfWork.CompanyPolicyRepository.GetCompanyPolicyFileNameById(companyPolicyRequestDto.Id);

                        if (companyPolicyRequestDto.EmailRequest)
                        {
                            //Email Notification to all
                            await _email.UpdatedPolicy(companyPolicyRequestDto.Name, true);                           
                        }
                        await _unitOfWork.CompanyPolicyRepository.AddPolicyHistory(companyPolicy);
                            if (fileData != null)
                            {
                                companyPolicy.FileName = fileData.FileName;
                                companyPolicy.FileOriginalName = fileData.FileOriginalName;
                            }
                        }
                    }
                    companyPolicy.Id = companyPolicyRequestDto.Id;
                    companyPolicy.Name = companyPolicyRequestDto.Name;
                    companyPolicy.DocumentCategoryId = companyPolicyRequestDto.DocumentCategoryId;
                    companyPolicy.StatusId = companyPolicyRequestDto.StatusId;
                    companyPolicy.Accessibility = companyPolicyRequestDto.Accessibility;
                    companyPolicy.Description = companyPolicyRequestDto.Description!;
                    companyPolicy.ModifiedBy = UserEmailId!;
                    companyPolicy.CreatedBy = UserEmailId!;
                    companyPolicy.ModifiedOn = DateTime.UtcNow;
                    companyPolicy.VersionNo = companyPolicyResponse.VersionNo;
                    companyPolicy.CreatedOn = companyPolicy.CreatedOn == default ? DateTime.UtcNow : companyPolicy.CreatedOn;
                    companyPolicy.EffectiveDate = DateTime.UtcNow;
                    companyPolicy.IsDeleted = false;

                    await _unitOfWork.CompanyPolicyRepository.AddPolicyHistory(companyPolicy);


                }
                if (companyPolicyRequestDto.FileContent != null)
                {
                    string fileName = Path.GetFileNameWithoutExtension(companyPolicyRequestDto.FileContent.FileName);
                    string fileExtension = Path.GetExtension(companyPolicyRequestDto.FileContent.FileName);
                    if (!string.IsNullOrEmpty(fileExtension) && _AllowedFileExtensions.Contains(fileExtension.ToLower()))
                    {
                        companyPolicy.FileName = fileName + "_" + DateTime.UtcNow.ToString("ddMMyyyyHHmmss") + fileExtension;
                        companyPolicy.FileOriginalName = companyPolicyRequestDto.FileContent.FileName;
                        if (!string.IsNullOrEmpty(companyPolicyResponse.FileName))
                        {
                            DeleteDocument(companyPolicyResponse.FileName!);
                        }
                        if (companyPolicyRequestDto.FileContent.Length < _appConfig.PolicyDocumentMaxSize)
                        {
                            isDocSaved = await CreatePolicyDocument(companyPolicyRequestDto.FileContent, companyPolicy.FileName);
                        }
                        else
                        {
                            return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidPolicyMaxSize, null);
                        }
                    }
                    else
                    {
                        return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.FileTypeIsNotSupport, null);
                    }
                }

                if (isDocSaved && isUpdatedCompanyPolicy)
                {
                    companyPolicy.Id = companyPolicyRequestDto.Id;
                    companyPolicy.Name = companyPolicyRequestDto.Name;
                    companyPolicy.DocumentCategoryId = companyPolicyRequestDto.DocumentCategoryId;
                    companyPolicy.StatusId = companyPolicyRequestDto.StatusId;
                    companyPolicy.Accessibility = companyPolicyRequestDto.Accessibility;
                    companyPolicy.Description = companyPolicyRequestDto.Description!;
                    companyPolicy.ModifiedBy = UserEmailId!;
                    companyPolicy.ModifiedOn = DateTime.UtcNow;
                    companyPolicy.EffectiveDate = companyPolicyRequestDto.StatusId == (int)CompanyPolicyStatus.Active ? DateTime.UtcNow : null;
                    await _unitOfWork.CompanyPolicyRepository.UpdateAsync(companyPolicy);
                    return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.OK, SuccessMessage.UpdatedCompanyPolicy, null);
                }
                else if (isDocSaved && !isUpdatedCompanyPolicy)
                {
                    return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.OK, SuccessMessage.VersionUpdated, null);
                }
                else
                {
                    return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.ErrorInSavingFile, null);
                }
            }


            return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.CompanyPolicyNotExist, null);

        }
        public async Task<ApiResponseModel<CompanyPolicyResponseDto>> Delete(long id)
        {
            var companyPolicyResponse = await _unitOfWork.CompanyPolicyRepository.GetByIdAsync(id);
            if (companyPolicyResponse != null)
            {
                CompanyPolicy companyPolicy = new();
                companyPolicy.ModifiedBy = UserEmailId;
                companyPolicy.Id = id;
                await _unitOfWork.CompanyPolicyRepository.DeleteAsync(companyPolicy);
                return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, null);
            }
            return new ApiResponseModel<CompanyPolicyResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
        }
        public async Task<ApiResponseModel<IEnumerable<PolicyStatusResponseDto>>> GetPolicyStatus()
        {
            var policyStatus = await _unitOfWork.CompanyPolicyRepository.GetPolicyStatus();

            if (policyStatus != null)
            {
                var policyStatusDto = _mapper.Map<IEnumerable<PolicyStatusResponseDto>>(policyStatus);
                return new ApiResponseModel<IEnumerable<PolicyStatusResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, policyStatusDto);
            }
            else
            {
                return new ApiResponseModel<IEnumerable<PolicyStatusResponseDto>>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }
        public async Task<ApiResponseModel<IEnumerable<CompanyPolicyDocCategoryResponseDto>>> GetDocumentCategory()
        {
            var documentCategory = await _unitOfWork.CompanyPolicyRepository.GetCompanyPolicyDocumentCategory();
            if (documentCategory != null)
            {
                var documentCategoryDto = _mapper.Map<List<CompanyPolicyDocCategoryResponseDto>>(documentCategory);
                return new ApiResponseModel<IEnumerable<CompanyPolicyDocCategoryResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, documentCategoryDto);
            }
            else
            {
                return new ApiResponseModel<IEnumerable<CompanyPolicyDocCategoryResponseDto>>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }
        public async Task<ApiResponseModel<CompanyPolicyHistorySearchResponseDto>> GetCompanyPolicyHistoryListById(SearchRequestDto<CompanyPolicyHistorySearchRequestDto> policyHistorySearchRequestDto)
        {
            var policyHistory = await _unitOfWork.CompanyPolicyRepository.GetPolicyHistory(policyHistorySearchRequestDto);
            if (policyHistory != null)
            {
                CompanyPolicyHistorySearchResponseDto policyHistorySearchResponseDto = new CompanyPolicyHistorySearchResponseDto();
                policyHistorySearchResponseDto.companyPolicyHistoryResponseDto = _mapper.Map<IEnumerable<CompanyPolicyHistoryResponseDto>>(policyHistory.companyPolicyHistoryResponseDto);
                policyHistorySearchResponseDto.TotalRecords = policyHistory.TotalRecords;

                return new ApiResponseModel<CompanyPolicyHistorySearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, policyHistorySearchResponseDto);
            }
            else
            {
                return new ApiResponseModel<CompanyPolicyHistorySearchResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<DownloadDocResponseDto>> DownloadPolicyDocument(UserCompanyPolicyTrackRequestDto request)
        {
            var filePath = Path.Combine(this._environment.WebRootPath, _filePathOptions.PolicyDirectoryLocation);
            string fileActualLocation = Path.GetFullPath(filePath + request.FileName);

            DownloadDocResponseDto companyPolicyDocDownloadResponseDto = new DownloadDocResponseDto();
            if (fileActualLocation.StartsWith(Path.GetFullPath(filePath), StringComparison.OrdinalIgnoreCase))
            {
                string fullPath = Path.Combine(filePath, request.FileName);
                companyPolicyDocDownloadResponseDto.FileContent = Helper.FileToByteArray(fullPath);
                var response = await _unitOfWork.CompanyPolicyRepository.GetCompanyPolicyTrack(request.CompanyPolicyId, request.EmployeeId);
                if (response > 0)
                {
                    await _unitOfWork.CompanyPolicyRepository.UpdateUserCompanyPolicyTrackAsync(request.CompanyPolicyId);
                }
                else
                {
                    await _unitOfWork.CompanyPolicyRepository.AddUserCompanyPolicyTrackAsync(request);
                }
                return new ApiResponseModel<DownloadDocResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, companyPolicyDocDownloadResponseDto);

            }

            return new ApiResponseModel<DownloadDocResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, companyPolicyDocDownloadResponseDto);
        }

        public async Task<ApiResponseModel<UserCompanyPolicyTrackSearchResponseDto>> GetUserCompanyPolicyTrack(SearchRequestDto<UserCompanyPolicyTrackSearchRequestDto> requestDto)
        {
            var userCompanyPolicyTrackSearchList = await _unitOfWork.CompanyPolicyRepository.GetUserCompanyPolicyTrackList(requestDto);
            if (userCompanyPolicyTrackSearchList != null && userCompanyPolicyTrackSearchList.CompanyPolicyTrackList.Any())
            {
                return new ApiResponseModel<UserCompanyPolicyTrackSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, userCompanyPolicyTrackSearchList);
            }
            else
            {
                return new ApiResponseModel<UserCompanyPolicyTrackSearchResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }
    }

}



