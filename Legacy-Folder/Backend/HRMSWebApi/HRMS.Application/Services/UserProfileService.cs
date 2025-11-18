using AutoMapper;
using HRMS.Application.Clients;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Configurations;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Domain.Utility;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models.Downtown;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.OfficialDetails;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using OfficeOpenXml;
using System.Net;
using System.Text.Json;

namespace HRMS.Application.Services
{
    public class UserProfileService : TokenService, IUserProfileService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly AppConfigOptions _appConfig;
        private readonly IHostingEnvironment _environment;
        private readonly FilePathOptions _filePathOptions;
        private readonly BlobStorageClient _blobStorageClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        




        public UserProfileService(IUnitOfWork unitOfWork, IMapper mapper, IOptions<AppConfigOptions> appConfig, IHostingEnvironment environment, IOptions<FilePathOptions> filePathOptions, BlobStorageClient blobStorageClient, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _appConfig = appConfig.Value;
            _environment = environment;
            _filePathOptions = filePathOptions.Value;
            _blobStorageClient = blobStorageClient;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<ApiResponseModel<IEnumerable<GovtDocumentResponseDto>>> GovtDocumentList(int idProofFor)
        {
            var documentList = await _unitOfWork.UserProfileRepository.GetDocumentType(idProofFor);
            if (documentList != null && documentList.Any())
            {
                var documentDtoList = _mapper.Map<IEnumerable<GovtDocumentResponseDto>>(documentList);
                return new ApiResponseModel<IEnumerable<GovtDocumentResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, documentDtoList);
            }
            else
            {
                return new ApiResponseModel<IEnumerable<GovtDocumentResponseDto>>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<PersonalDetailsResponseDto>> GetPersonalDetailsById(long id)
        {
            var personalDetailsResponse = await _unitOfWork.UserProfileRepository.GetPersonalDetailByIdAsync(id);
            if (personalDetailsResponse != null)
            {
                var request = _httpContextAccessor.HttpContext.Request;
                personalDetailsResponse.FileName = !string.IsNullOrWhiteSpace(personalDetailsResponse.FileName) ? $"{request.Scheme}://{request.Host}/Images/ProfileImage/{personalDetailsResponse.FileName}" : "";
                personalDetailsResponse.Address = personalDetailsResponse.AddressJson != null ? JsonSerializer.Deserialize<AddressResponseDto>(personalDetailsResponse.AddressJson) : personalDetailsResponse.Address;
                personalDetailsResponse.PermanentAddress = personalDetailsResponse.PermanentAddressJson != null ? JsonSerializer.Deserialize<PermanentAddressResponseDto>(personalDetailsResponse.PermanentAddressJson) : personalDetailsResponse.PermanentAddress;

                return new ApiResponseModel<PersonalDetailsResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, personalDetailsResponse);
            }
            else
            {
                return new ApiResponseModel<PersonalDetailsResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<List<CountryResponseDto>>> GetCountryList()
        {
            var countryResponseDto = await _unitOfWork.UserProfileRepository.GetCountryListAsync();
            if (countryResponseDto != null && countryResponseDto.Any())
            {
                var countryDto = _mapper.Map<List<CountryResponseDto>>(countryResponseDto);
                return new ApiResponseModel<List<CountryResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, countryDto);
            }
            else
            {
                return new ApiResponseModel<List<CountryResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<List<StateResponseDto>>> GetStateListByCountryId(long id)
        {
            var StateListResponse = await _unitOfWork.UserProfileRepository.GetStateListByCountryIdAsync(id);
            if (StateListResponse != null && StateListResponse.Any())
            {
                var companyPolicyDto = _mapper.Map<List<StateResponseDto>>(StateListResponse);
                return new ApiResponseModel<List<StateResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, companyPolicyDto);
            }
            else
            {
                return new ApiResponseModel<List<StateResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        private async Task<bool> SaveUserProfile(IFormFile file, string fileName)
        {
            var filePath = Path.Combine(this._environment.WebRootPath, _filePathOptions.ProfileDirectoryLocation);
            string fileActualLocation = Path.GetFullPath(filePath + fileName);
            if (fileActualLocation.StartsWith(Path.GetFullPath(filePath), StringComparison.OrdinalIgnoreCase))
            {
                if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(filePath);
                }
                using (Stream fileStream = new FileStream(filePath + fileName, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }
                return true;
            }
            return false;
        }

        public async Task<ApiResponseModel<CrudResult>> UploadUserProfileImage(UploadFileRequest request)
        {
            string extension = string.Empty;
            if (request.file != null)
            {
                extension = Path.GetExtension(request.file.FileName).ToLower();
                if (request.file.Length > _appConfig.UserProfileMaxSize)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidImageMaxSize, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NoFile, CrudResult.Failed);
            }

            var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(request.userId);
            if (userResponse != null)
            {
                string fileName = userResponse.Id.ToString() + "_" + DateTime.UtcNow.ToString("ddMMyyHHmmss") + extension;
                bool status = await SaveUserProfile(request.file, fileName);
                if (status)
                {
                    var updateResponse = await _unitOfWork.UserProfileRepository.UpdateUserProfileImage(request.userId, fileName, request.file.FileName, UserEmailId!);
                    if (updateResponse > 0)
                    {
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                    }
                    else
                    {
                        DeleteUserProfilePicture(fileName);
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorInFileNameUpdate, CrudResult.Failed);
                    }
                }
                else
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.FileNotSaved, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.UserNotExist, CrudResult.Failed);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> AddPersonalDetail(PersonalDetailsRequestDto personalDetailsRequestDto)
        {
            int PersonalDetailsResponse = 0;
            if (personalDetailsRequestDto != null)
            {
                if (await _unitOfWork.UserProfileRepository.PersonalEmailExistsAsync(personalDetailsRequestDto.PersonalEmail!))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.EmailAlreadyExists, CrudResult.Failed);
                }
                var addressList = _mapper.Map<Address>(personalDetailsRequestDto.Address);
                var employeeData = _mapper.Map<EmployeeData>(personalDetailsRequestDto);
                var PermanentaddressList = _mapper.Map<PermanentAddress>(personalDetailsRequestDto.PermanentAddress);
                employeeData.CreatedBy = UserEmailId!;
                addressList.CreatedBy = UserEmailId!;
                PermanentaddressList.CreatedBy = UserEmailId!;
                PersonalDetailsResponse = await _unitOfWork.UserProfileRepository.AddPersonalDetail(employeeData, addressList, PermanentaddressList);
            }
            if (PersonalDetailsResponse > 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.RecordNotAdded, CrudResult.Failed);
            }
        }

        private bool DeleteUserProfilePicture(string fileName)
        {
            var filePath = Path.Combine(this._environment.WebRootPath, _filePathOptions.ProfileDirectoryLocation);
            string fileActualLocation = Path.GetFullPath(filePath + fileName);
            if (fileActualLocation.StartsWith(Path.GetFullPath(filePath), StringComparison.OrdinalIgnoreCase))
            {
                return Helper.DeleteFile(fileName, filePath);
            }
            return false;
        }

        public async Task<ApiResponseModel<CrudResult>> RemoveUserProfileImage(long id)
        {
            var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(id);
            if (userResponse != null)
            {
                if (!string.IsNullOrEmpty(userResponse.FileName))
                {
                    var updateResponse = await _unitOfWork.UserProfileRepository.UpdateUserProfileImage(id, string.Empty, string.Empty, UserEmailId!);
                    if (updateResponse > 0)
                    {
                        bool status = DeleteUserProfilePicture(userResponse.FileName);
                        if (status)
                            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                        else
                        {
                            await _unitOfWork.UserProfileRepository.UpdateUserProfileImage(id, userResponse.FileName, userResponse.FileOriginalName, UserEmailId!);
                            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorFileDeletion, CrudResult.Failed);
                        }
                    }
                    else
                    {
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorInFileNameUpdate, CrudResult.Failed);
                    }
                }
                else
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.ProfileImageNotExists, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.UserNotExist, CrudResult.Failed);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> UpdateProfilePicture(UploadFileRequest request)
        {
            string extension = default!;
            if (request.file != null)
            {
                extension = Path.GetExtension(request.file.FileName).ToLower();
                if (request.file.Length > _appConfig.UserProfileMaxSize)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidImageMaxSize, CrudResult.Failed);
                }
                var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(request.userId);

                if (userResponse != null)
                {
                    string fileName = userResponse.Id.ToString() + "_" + DateTime.UtcNow.ToString("ddMMyyHHmmss") + extension;
                    bool status = await SaveUserProfile(request.file, fileName);
                    if (status)
                    {
                        var updateResponse = await _unitOfWork.UserProfileRepository.UpdateUserProfileImage(request.userId, fileName, request.file.FileName, UserEmailId!);
                        if (updateResponse > 0)
                        {
                            if (!string.IsNullOrEmpty(userResponse.FileName))
                            {
                                DeleteUserProfilePicture(userResponse.FileName);
                            }
                            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                        }
                        else
                        {
                            DeleteUserProfilePicture(fileName);
                            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.UpdateFailed, CrudResult.Failed);
                        }
                    }
                    else
                    {
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.FileNotSaved, CrudResult.Failed);
                    }
                }
                else
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.UserNotExist, CrudResult.Failed);
                }
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NoFile, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<List<UserDocumentResponseDto>>> GetUserDocumentListAsync(long employeeId)
        {
            if (employeeId > 0)
            {
                var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(employeeId);
                if (userResponse != null)
                {
                    var userDocumentListResponse = await _unitOfWork.UserProfileRepository.GetUserDocumentListAsync(employeeId);
                    if (userDocumentListResponse != null && userDocumentListResponse.Any())
                    {
                        var documentList = _mapper.Map<List<UserDocumentResponseDto>>(userDocumentListResponse);
                        return new ApiResponseModel<List<UserDocumentResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, documentList);
                    }
                    else
                    {
                        return new ApiResponseModel<List<UserDocumentResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
                    }
                }
                else
                {
                    return new ApiResponseModel<List<UserDocumentResponseDto>>((int)HttpStatusCode.NotFound, ErrorMessage.UserNotExist, null);
                }
            }
            else
            {
                return new ApiResponseModel<List<UserDocumentResponseDto>>((int)HttpStatusCode.BadRequest, ErrorMessage.EmployeeIdZero, null);
            }
        }

        public async Task<ApiResponseModel<UserDocumentResponseDto>> GetUserDocumentById(long id)
        {
            var response = await _unitOfWork.UserProfileRepository.GetUserDocumentById(id);
            if (response != null)
            {
                return new ApiResponseModel<UserDocumentResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<UserDocumentResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> UploadUserDocument(UserDocumentRequestDto userDocumentRequestDto)
        {
            if (await _unitOfWork.UserProfileRepository.EmployeeDocumentTypeExistsAsync(userDocumentRequestDto))
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.DocumentAlreadyExists, CrudResult.Failed);
            }
            if (userDocumentRequestDto.File != null)
            {
                if (userDocumentRequestDto.File.Length > _appConfig.UserDocFileMaxSize)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidDocMaxSize, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NoFile, CrudResult.Failed);
            }
            var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(userDocumentRequestDto.EmployeeId);
            var govtDocument = await _unitOfWork.UserProfileRepository.GetGovtDocumentTypeById(userDocumentRequestDto.DocumentTypeId);
            if (govtDocument != null)
            {
                if (govtDocument.IsExpiryDateRequired && userDocumentRequestDto.DocumentExpiry == null)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.DocumentExpiryNotEntered, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.EmployerDocumentTypeNotFound, CrudResult.Failed);
            }
            if (userResponse != null)
            {
                string fileName = await _blobStorageClient.UploadFile(userDocumentRequestDto.File, userDocumentRequestDto.EmployeeId, BlobContainerConstants.UserDocumentContainer);
                if (!string.IsNullOrEmpty(fileName))
                {
                    var userDocument = _mapper.Map<UserDocument>(userDocumentRequestDto);
                    userDocument.Location = fileName;
                    userDocument.DocumentName = userDocumentRequestDto.File.FileName;
                    userDocument.CreatedBy = UserEmailId!;

                    var response = await _unitOfWork.UserProfileRepository.UploadUserDocument(userDocument);
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
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.UserNotExist, CrudResult.Failed);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> UpdateUploadUserDocument(UserDocumentRequestDto userDocumentRequestDto)
        {
            if (await _unitOfWork.UserProfileRepository.EmployeeDocumentTypeExistsAsync(userDocumentRequestDto))
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.DocumentAlreadyExists, CrudResult.Failed);
            }

            if (userDocumentRequestDto.File != null && userDocumentRequestDto.File.Length > _appConfig.UserDocFileMaxSize)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidDocMaxSize, CrudResult.Failed);
            }

            var userDocumentResponse = await _unitOfWork.UserProfileRepository.GetUserDocumentById(userDocumentRequestDto.Id);
            var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(userDocumentRequestDto.EmployeeId);
            var govtDocument = await _unitOfWork.UserProfileRepository.GetGovtDocumentTypeById(userDocumentRequestDto.DocumentTypeId);
            if (govtDocument != null)
            {
                if (govtDocument.IsExpiryDateRequired && userDocumentRequestDto.DocumentExpiry == null)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.DocumentExpiryNotEntered, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.EmployerDocumentTypeNotFound, CrudResult.Failed);
            }
            if (userResponse != null && userDocumentResponse != null)
            {
                var userDocument = _mapper.Map<UserDocument>(userDocumentRequestDto);
                userDocument.Id = userDocumentRequestDto.Id;
                userDocument.ModifiedBy = UserEmailId;
                userDocument.ModifiedOn = DateTime.UtcNow;
                if (userDocumentRequestDto.File != null)
                {
                    string fileName = await _blobStorageClient.UploadFile(userDocumentRequestDto.File, userDocumentRequestDto.EmployeeId, BlobContainerConstants.UserDocumentContainer);
                    if (!string.IsNullOrEmpty(fileName))
                    {
                        userDocument.Location = fileName;
                        userDocument.DocumentName = userDocumentRequestDto.File.FileName;
                    }
                    else
                    {
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorUploadFileOnBlob, CrudResult.Failed);
                    }
                }

                var response = await _unitOfWork.UserProfileRepository.UpdateUserDocument(userDocument);
                if (response > 0)
                {
                    if (!string.IsNullOrWhiteSpace(userDocumentResponse!.Location) && !string.IsNullOrWhiteSpace(userDocument.Location))
                    {
                        await _blobStorageClient.DeleteFile(userDocumentResponse.Location, BlobContainerConstants.UserDocumentContainer);
                    }
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                else
                {
                    await _blobStorageClient.DeleteFile(userDocument.Location, BlobContainerConstants.UserDocumentContainer);
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorDocumentInfoInDB, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.UserNotExist, CrudResult.Failed);
            }
        }

        public async Task<ApiResponseModel<List<CityResponseDto>>> GetCityListByStateId(long id)
        {
            var cityListResponse = await _unitOfWork.UserProfileRepository.GetCityListByStateIdAsync(id);
            if (cityListResponse != null && cityListResponse.Any())
            {
                var cityListDto = _mapper.Map<List<CityResponseDto>>(cityListResponse);
                return new ApiResponseModel<List<CityResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, cityListDto);
            }
            else
            {
                return new ApiResponseModel<List<CityResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<byte[]?>> DownloadUserDocument(string employerDocumentContainer, string filename)
        {
            if (!string.IsNullOrEmpty(filename))
            {
                var blob = await _blobStorageClient.DownloadFile(employerDocumentContainer, filename);
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

        public async Task<ApiResponseModel<string?>> GetUserDocumentSasUrl(BlobDocumentContainerType containerType, string filename)
        {
            string? container = null;
            if (containerType == BlobDocumentContainerType.UserDocumentContainer)
                container = BlobContainerConstants.UserDocumentContainer;
            else if (containerType == BlobDocumentContainerType.EmployerDocumentContainer)
                container = BlobContainerConstants.EmployerDocumentContainer;

            if (container == null || string.IsNullOrEmpty(filename))
            {
                return new ApiResponseModel<string?>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidDocumentContainerType, null);
            }
            if (!string.IsNullOrEmpty(filename))
            {
                var url = await _blobStorageClient.GetFileSasUrl(container, filename);
                if (url != null)
                {
                    return new ApiResponseModel<string?>((int)HttpStatusCode.OK, SuccessMessage.Success, url);
                }
                else
                {
                    return new ApiResponseModel<string?>((int)HttpStatusCode.BadRequest, ErrorMessage.FileNotExist, null);
                }
            }
            else
            {
                return new ApiResponseModel<string?>((int)HttpStatusCode.BadRequest, ErrorMessage.FileNameRequired, null);
            }
        }

        public async Task<ApiResponseModel<IEnumerable<QualificationResponseDto>>> GetQualificationList()
        {
            var qualificationList = await _unitOfWork.UserProfileRepository.GetQualificationListAsync();
            if (qualificationList != null && qualificationList.Any())
            {
                var userProfileDto = _mapper.Map<List<QualificationResponseDto>>(qualificationList);

                return new ApiResponseModel<IEnumerable<QualificationResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, userProfileDto);
            }
            else
            {
                return new ApiResponseModel<IEnumerable<QualificationResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        /// <summary>
        /// Get relationships list
        /// </summary>
        /// <returns></returns>
        public async Task<ApiResponseModel<IEnumerable<RelationshipResponseDto>>> GetRelationshipList()
        {
            var relationshipListResponse = await _unitOfWork.UserProfileRepository.GetRelationships();
            if (relationshipListResponse != null && relationshipListResponse.Any())
            {
                var relationshipListDto = _mapper.Map<List<RelationshipResponseDto>>(relationshipListResponse);

                return new ApiResponseModel<IEnumerable<RelationshipResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, relationshipListDto);
            }
            else
            {
                return new ApiResponseModel<IEnumerable<RelationshipResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<IEnumerable<DepartmentResponseDto>>> GetDepartmentList()
        {
            var departmentList = await _unitOfWork.UserProfileRepository.GetDepartmentList();
            if (departmentList != null && departmentList.Any())
            {
                return new ApiResponseModel<IEnumerable<DepartmentResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, departmentList);
            }
            return new ApiResponseModel<IEnumerable<DepartmentResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
        }

        public async Task<ApiResponseModel<IEnumerable<TeamResponseDto>>> GetTeamList()
        {
            var teamList = await _unitOfWork.UserProfileRepository.GetTeamList();
            if (teamList != null && teamList.Any())
            {
                return new ApiResponseModel<IEnumerable<TeamResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, teamList);
            }
            return new ApiResponseModel<IEnumerable<TeamResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
        }

        private async Task UpdateEmployeeLeaveOnGenderUpdate(long empId)
        {
            var leaveBalanceDto = await _unitOfWork.LeaveManagementRepository.GetEmployeeLevesByIdAsync(empId);
            var mlData = leaveBalanceDto.FirstOrDefault(x => x.LeaveId == (int)LeaveEnum.ML);
            if (mlData != null && mlData.IsActive)
            {
                var mlLeave = new EmployeeLeave()
                {
                    ModifiedBy = UserEmailId,
                    EmployeeId = empId,
                    LeaveId = (int)LeaveEnum.ML,
                    IsActive = false,
                    Description = SuccessMessage.LeaveDisabledDueToGenderUpdate,
                    OpeningBalance = mlData.OpeningBalance,
                };
                await _unitOfWork.LeaveManagementRepository.UpdateLeaveBalanceAsync(mlLeave);
            }
            var plData = leaveBalanceDto.FirstOrDefault(x => x.LeaveId == (int)LeaveEnum.PL);
            if (plData != null && plData.IsActive)
            {
                var plLeave = new EmployeeLeave()
                {
                    ModifiedBy = UserEmailId,
                    EmployeeId = empId,
                    LeaveId = (int)LeaveEnum.PL,
                    IsActive = false,
                    Description = SuccessMessage.LeaveDisabledDueToGenderUpdate,
                    OpeningBalance = plData.OpeningBalance,
                };
                await _unitOfWork.LeaveManagementRepository.UpdateLeaveBalanceAsync(plLeave);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> UpdatePersonalDetail(PersonalDetailsRequestDto personalDetailsRequestDto)
        {
            if (personalDetailsRequestDto == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.UpdateRequesEmpty, CrudResult.Failed);
            }
            if (personalDetailsRequestDto.Id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidEmployeeId, CrudResult.Failed);
            }

            var personalDetail = await _unitOfWork.UserProfileRepository.GetPersonalDetailByIdAsync(personalDetailsRequestDto.Id);

            if (personalDetail.Gender != personalDetailsRequestDto.Gender && Enum.IsDefined(typeof(Gender), personalDetailsRequestDto.Gender))
            {
                await UpdateEmployeeLeaveOnGenderUpdate(personalDetail.Id);
            }

            int PersonalDetailsResponse = 0;
            if (personalDetailsRequestDto != null)
            {
                var address = _mapper.Map<Address>(personalDetailsRequestDto.Address);
                address.EmployeeId = personalDetailsRequestDto.Id;
                var permanentAddress = _mapper.Map<PermanentAddress>(personalDetailsRequestDto.PermanentAddress);
                permanentAddress.EmployeeId = personalDetailsRequestDto.Id;
                var employeeData = _mapper.Map<EmployeeData>(personalDetailsRequestDto);
                employeeData.ModifiedBy = UserEmailId!;
                address.ModifiedBy = UserEmailId!;
                address.CreatedBy = UserEmailId!;
                address.AddressType = AddressType.CurrentAddress;
                permanentAddress.ModifiedBy = UserEmailId!;
                permanentAddress.CreatedBy = UserEmailId!;
                permanentAddress.AddressType = AddressType.PermanentAddress;
                PersonalDetailsResponse = await _unitOfWork.UserProfileRepository.UpdatePersonalDetail(employeeData, address, permanentAddress);
            }

            if (PersonalDetailsResponse > 0)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.RecordNotUpdated, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<EmployeeListSearchResponseDto>> GetEmployees(SearchRequestDto<EmployeeSearchRequestDto> employeeSearchRequestDto)
        { 
            var response = await _unitOfWork.UserProfileRepository.GetEmployeesList(employeeSearchRequestDto);
            if (response != null && response.EmployeeList.Any())
            {
                return new ApiResponseModel<EmployeeListSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            return new ApiResponseModel<EmployeeListSearchResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
        }

        public async Task<ApiResponseModel<IEnumerable<ReportingManagerResponseDto>>> GetReportingManagerList(string? name, int? RoleId)
        {
            name = name ?? string.Empty;
            RoleId = RoleId ?? 0;

            var ReportingManagerList = await _unitOfWork.UserProfileRepository.GetReportingManagerListAsync(name,RoleId);
            if (ReportingManagerList != null)
            {
                return new ApiResponseModel<IEnumerable<ReportingManagerResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, ReportingManagerList);
            }
            else
                return new ApiResponseModel<IEnumerable<ReportingManagerResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
        }

        public async Task<ApiResponseModel<List<UniversityResponseDto>>> GetUniversitiesList()
        {
            var universities = await _unitOfWork.UserProfileRepository.GetUniversityListAsync();
            if (universities != null && universities.Any())
            {
                var universitiesListDto = _mapper.Map<List<UniversityResponseDto>>(universities);

                return new ApiResponseModel<List<UniversityResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, universitiesListDto);
            }
            else
            {
                return new ApiResponseModel<List<UniversityResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> AddDepartment(DepartmentRequestDto request)
        {
            if (request == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            else
            {
                request.Department = string.IsNullOrEmpty(request.Department) ? "" : request.Department.Trim();
                if (string.IsNullOrEmpty(request.Department))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.ValidTeam, CrudResult.Failed);
                }
                var existDepartment = await _unitOfWork.UserProfileRepository.GetDepartmentByName(request.Department);
                if (existDepartment != null && !string.IsNullOrEmpty(existDepartment.Name))
                {
                    if (!existDepartment.Status)
                    {
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.ActiveDepartmentExist, CrudResult.Failed);
                    }
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.DeactivatedDepartmentExist, CrudResult.Failed);
                }

                var departmentDto = _mapper.Map<Departments>(request);

                departmentDto.CreatedBy = UserEmailId!;
                departmentDto.CreatedOn = DateTime.UtcNow;

                var response = await _unitOfWork.UserProfileRepository.AddAsync(departmentDto);
                if (response != null)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.DepartmentAdded, CrudResult.Success);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.DepartmentIsNotSaved, CrudResult.Failed);
            } 
        }

        public async Task<ApiResponseModel<CrudResult>> AddTeam(TeamRequestDto request)
        {
            if (request == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            else
            {
                request.TeamName = string.IsNullOrEmpty(request.TeamName) ? "" : request.TeamName.Trim();
                if (string.IsNullOrEmpty(request.TeamName))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.ValidTeam, CrudResult.Failed);
                }
                var existTeam = await _unitOfWork.UserProfileRepository.GetTeamByNameAsync(request.TeamName);
                if (existTeam != null && !string.IsNullOrEmpty(existTeam.Name))
                {
                    if (!existTeam.Status )
                    {
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.ActiveTeamExist, CrudResult.Failed);
                    }
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.DeactivatedTeamExist, CrudResult.Failed);
                }

                var teamDto = _mapper.Map<Teams>(request);
                teamDto.CreatedBy = UserEmailId!;
                var response =  await _unitOfWork.UserProfileRepository.AddTeamAsync(teamDto);
                if (response != null)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.TeamAdded, CrudResult.Success);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.TeamIsNotSaved, CrudResult.Failed);
                
            }
            
        }

        public async Task<ApiResponseModel<CrudResult>> UpdateTeam(TeamRequestDto request)
        {
            var response = await _unitOfWork.UserProfileRepository.GetTeamByIdAsync(request.Id);
            if (response == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            
            }
            else
            {
                request.TeamName = string.IsNullOrEmpty(request.TeamName) ? "" : request.TeamName.Trim();
                if (string.IsNullOrEmpty(request.TeamName))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.ValidTeam, CrudResult.Failed);
                }
                var existTeam = await _unitOfWork.UserProfileRepository.GetTeamByNameAsync(request.TeamName);
                if (existTeam != null && !string.IsNullOrEmpty(existTeam.Name))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.ActiveTeamExist, CrudResult.Failed);
                }
                var team = _mapper.Map<Teams>(request);
                team.ModifiedBy = UserEmailId;
                await _unitOfWork.UserProfileRepository.UpdateTeam(team); 
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            
        }

        public async Task<ApiResponseModel<CrudResult>> DeleteTeam(long id)
        {
            if (id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, CrudResult.Failed);
            }
            var teamResponse = await _unitOfWork.UserProfileRepository.GetTeamByIdAsync(id);
            if (teamResponse != null)
            {
                Teams teams = new();
                teams.ModifiedBy = UserEmailId;
                teams.Id = id;
                var sucess = await _unitOfWork.UserProfileRepository.DeleteTeamAsync(teams);
                if (sucess > 0)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.RecordNotDeleted, CrudResult.Failed);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }
        public async Task<ApiResponseModel<CrudResult>> EditDepartment(DepartmentRequestDto request)
        {
            if (request == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            else
            {
                request.Department = string.IsNullOrEmpty(request.Department) ? "" : request.Department.Trim();
                if (string.IsNullOrEmpty(request.Department))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.ValidDepartment, CrudResult.Failed);
                }
                var existDepartment = await _unitOfWork.UserProfileRepository.GetDepartmentByName(request.Department);
                if (existDepartment != null && !string.IsNullOrEmpty(existDepartment.Name))
                { 
                     return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.ActiveDepartmentExist, CrudResult.Failed); 
                }
                var departmentResponse = await _unitOfWork.UserProfileRepository.GetDepartmentById(request.Id);
                if (departmentResponse != null)
                {
                    var departmentDto = _mapper.Map<Departments>(request);
                    departmentDto.CreatedBy = UserEmailId!;
                    departmentDto.CreatedOn = DateTime.UtcNow;

                    await _unitOfWork.UserProfileRepository.UpdateDepartment(departmentDto);
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.UpdatedDepartment, CrudResult.Success);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
        }
        public async Task<ApiResponseModel<CrudResult>> DeleteDepartment(long id)
        {
            if (id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, CrudResult.Failed);
            }

            var departmentResponse = await _unitOfWork.UserProfileRepository.GetDepartmentById(id);
            if (departmentResponse != null)
            {
                Departments departments = new();
                departments.Id = id;
                departments.Id = departmentResponse.Id;
                departments.ModifiedBy = UserEmailId;
                departments.ModifiedOn = DateTime.UtcNow;
                await _unitOfWork.UserProfileRepository.DeleteDepartment(departments);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.DeletedDepartment, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }
        public async Task<ApiResponseModel<CrudResult>> UpdateOfficialDetails(OfficialDetailsRequestDto request)
        {
            if (request == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            else
            {
                var officialDetailsResponseDto = await _unitOfWork.UserProfileRepository.GetOfficialDetailsById(request.Id);
                if (officialDetailsResponseDto != null || officialDetailsResponseDto == null)
                {
                    var officialDetailDto = _mapper.Map<OfficialDetails>(request);
                    var bankDetails = _mapper.Map<BankDetails>(request.BankDetails);
                    officialDetailDto.ModifiedBy = UserEmailId!;
                    bankDetails.ModifiedBy = UserEmailId!;
                    bankDetails.CreatedBy = UserEmailId!;

                    await _unitOfWork.UserProfileRepository.UpdateOfficialDetails(officialDetailDto, bankDetails);
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.UpdatedOfficialDetails, CrudResult.Success);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }

        }
        public async Task<ApiResponseModel<OfficialDetailsResponseDto>> GetOfficialDetailsById(long id)
        {
            var OfficialDetailsResponse = await _unitOfWork.UserProfileRepository.GetOfficialDetailsById(id);
            if (OfficialDetailsResponse != null)
            {

                return new ApiResponseModel<OfficialDetailsResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, OfficialDetailsResponse);
            }
            else
            {
                return new ApiResponseModel<OfficialDetailsResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        public static string ValidateHeaders(Dictionary<string, int> headerMap, List<string> requiredHeaders)
        {
            var missingHeaders = requiredHeaders
                .Where(header => !headerMap.ContainsKey(header))
                .ToList();

            if (missingHeaders.Any())
            {
                return $"Missing required column(s): {string.Join(", ", missingHeaders)}";
            }
            return "";
        }

        private static DateOnly? CovertToDate(string date)
        {
            string[] formats = new string[] { "MM/dd/yyyy", "MM-dd-yyyy" };
            if (!string.IsNullOrEmpty(date) && DateOnly.TryParseExact(date, formats, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out DateOnly dateOnly))
            {   
                return dateOnly;
            }
            return null;
        }

        private static string? ParseJobType(string input)
        {
            if (!string.IsNullOrEmpty(input) && Enum.TryParse<JobType>(input, true, out var result) && Enum.IsDefined(typeof(JobType), result))
            {
                return result.ToString();
            }
            return null;
        }

        private static string? ParseMaritalStatus(string input)
        {
            if (!string.IsNullOrEmpty(input) && Enum.TryParse<MaritalStatus>(input, true, out var result) && Enum.IsDefined(typeof(MaritalStatus), result))
            {
                return result.ToString();
            }
            return null;
        }

        private static string? CheckIsNullOrEmpty(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return null;
            }
            return input;
        }

        public static string GetValidTrimData(string input)
        {
            if (!string.IsNullOrEmpty(input))
            {
                input = input.Trim();

            }
            return input;
        }

        public async Task<ApiResponseModel<CrudResult>> ImportExcelForEmployes(IFormFile employeesExcel, bool importConfirmed)
        {
            if (employeesExcel == null || employeesExcel.Length == 0)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, CrudResult.Failed);

            if(employeesExcel.Length > _appConfig.ExcelImportMaxSize)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidExcelFileMaxSize, CrudResult.Failed);

            var extension = Path.GetExtension(employeesExcel.FileName).ToLower();
            if (!FileValidations.AllowedExtensions.Contains(extension))
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalideExcelFile, CrudResult.Failed);

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            var employees = new List<ImportEmployeesExcelData>();
            var invalidRecords = new List<(int Row, string Reason)>();

            try
            {
                var employeeCodes = _unitOfWork.UserProfileRepository.GetAllEmployeeCodesAsync().Result.ToList();
                Dictionary<string, string> employeeCodeObj = new Dictionary<string, string>();
                var duplicateRecords = new List<(string email, string code)>();

                if (employeeCodes != null && employeeCodes.Count > 0)
                {
                    employeeCodeObj = employeeCodes.ToDictionary(item => item.Email.ToLower().Trim(), item => item.EmployeeCode);
                }

                using (var stream = new MemoryStream())
                {
                    await employeesExcel.CopyToAsync(stream);
                    using (var package = new ExcelPackage(stream))
                    {
                        var worksheet = package.Workbook.Worksheets.First();
                        var rowCount = worksheet.Dimension.Rows;
                        var headerRow = worksheet.Cells[1, 1, 1, worksheet.Dimension.Columns].ToList();
                        var headerMap = headerRow.ToDictionary(cell => cell.Text.Trim().ToLower().Replace("\u00A0", " "), cell => cell.Start.Column);

                        var requiredHeaders = new List<string>
                        {
                            "sl no",
                            "employee name",
                            "father's name",
                            "gender",
                            "dob",
                            "code",
                            "email",
                            "current address",
                            "permanent address",
                            "city",
                            "state",
                            "pin",
                            "emergency no",
                            "doj",
                            "confirmation date",
                            "job type",
                            "branch",
                            "has pf",
                            "bank name",
                            "bank account no",
                            "ifsc",
                            "pan",
                            "department",
                            "designation",
                            "reporting manager",
                            "mobile no",
                            "personal email",
                            "blood group",
                            "marital status",
                            "uan number",
                            "aadhar number",
                        };
                        string unavailableHeaders = ValidateHeaders(headerMap, requiredHeaders);

                        if (!string.IsNullOrEmpty(unavailableHeaders))
                        {
                            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, unavailableHeaders, CrudResult.Failed);
                        }
                        else
                        {
                            for (int row = 2; row <= rowCount  ; row++)
                            {
                                var employeeCodeText = worksheet.Cells[row, headerMap["code"]].Text;
                                var emailText = worksheet.Cells[row, headerMap["email"]].Text;
                                var personalemail = worksheet.Cells[row, headerMap["personal email"]].Text;
                                var moblileNo = worksheet.Cells[row, headerMap["mobile no"]].Text;
                                var gender = worksheet.Cells[row, headerMap["gender"]].Text.ToLower();
                                var currentAddresstext = worksheet.Cells[row, headerMap["current address"]].Text;
                                var permanentAddresstext = worksheet.Cells[row, headerMap["permanent address"]].Text;

                                if (!(string.IsNullOrEmpty(employeeCodeText) || string.IsNullOrEmpty(emailText)))
                                {
                                    if (employeeCodeObj.ContainsKey(emailText.ToLower().Trim()) || employeeCodeObj.ContainsValue(employeeCodeText))
                                    {
                                        duplicateRecords.Add((emailText.ToLower().Trim(), employeeCodeText));
                                    }
                                    else
                                    {
                                        employeeCodeObj.Add(emailText.ToLower().Trim(), employeeCodeText);
                                    }

                                    switch (true)
                                    {
                                        case var _ when string.IsNullOrWhiteSpace(personalemail):
                                            invalidRecords.Add((row, "Missing Personal Email"));
                                            continue;

                                        case var _ when string.IsNullOrWhiteSpace(moblileNo):
                                            invalidRecords.Add((row, "Missing Mobile No"));
                                            continue;
                                        case var _ when string.IsNullOrWhiteSpace(currentAddresstext):
                                            invalidRecords.Add((row, "Missing current address"));
                                            continue;
                                        case var _ when string.IsNullOrWhiteSpace(permanentAddresstext):
                                            invalidRecords.Add((row, "Missing permanent address "));
                                            continue;
                                    }

                                    string[] genders = ["male", "female","other"];
                                    var employee = new ImportEmployeesExcelData
                                    {
                                        SlNo = int.Parse(worksheet.Cells[row, headerMap["sl no"]].Text),
                                        Code = employeeCodeText,
                                        EmployeeName = worksheet.Cells[row, headerMap["employee name"]].Text,
                                        FathersName = worksheet.Cells[row, headerMap["father's name"]].Text,
                                        Gender = genders.Contains(gender?.ToLower()) ? gender.ToTitleCase(): "",
                                        DOB = CovertToDate(worksheet.Cells[row, headerMap["dob"]].Text),
                                        Email = worksheet.Cells[row, headerMap["email"]].Text,
                                        CurrentAddress = currentAddresstext,
                                        PermanentAddress = permanentAddresstext,
                                        City = worksheet.Cells[row, headerMap["city"]].Text.ToLower(),
                                        State = worksheet.Cells[row, headerMap["state"]].Text.ToLower(),
                                        Pin = worksheet.Cells[row, headerMap["pin"]].Text,
                                        Country = "India",
                                        EmergencyNo = worksheet.Cells[row, headerMap["emergency no"]].Text,
                                        DOJ = CovertToDate(worksheet.Cells[row, headerMap["doj"]].Text),
                                        ConfirmationDate = CovertToDate(worksheet.Cells[row, headerMap["confirmation date"]].Text),
                                        JobType = ParseJobType(worksheet.Cells[row, headerMap["job type"]].Text),
                                        Branch = CheckIsNullOrEmpty(worksheet.Cells[row, headerMap["branch"]].Text),
                                        PFNo = null,
                                        PFDate = null,
                                        BankName = worksheet.Cells[row, headerMap["bank name"]].Text,
                                        BankAccountNo = worksheet.Cells[row, headerMap["bank account no"]].Text,
                                        IFSCCode = worksheet.Cells[row, headerMap["ifsc"]].Text,
                                        PAN = worksheet.Cells[row, headerMap["pan"]].Text.ToUpper(),
                                        ESINo = null,
                                        Department = GetValidTrimData(worksheet.Cells[row, headerMap["department"]].Text),
                                        Designation = GetValidTrimData(worksheet.Cells[row, headerMap["designation"]].Text),
                                        ReportingManager = GetValidTrimData(worksheet.Cells[row, headerMap["reporting manager"]].Text),
                                        PassportNo = null,
                                        PassportExpiry = null,
                                        Telephone = null,
                                        MobileNo = moblileNo,
                                        PersonalEmail = personalemail,
                                        BloodGroup = worksheet.Cells[row, headerMap["blood group"]].Text,
                                        MaritalStatus = ParseMaritalStatus(worksheet.Cells[row, headerMap["marital status"]].Text),
                                        UANNumber = worksheet.Cells[row, headerMap["uan number"]].Text,
                                        HasPF = worksheet.Cells[row, headerMap["has pf"]].Text.ToUpper() == "YES" ,
                                        HasESI = false,
                                        AadhaarNo = CheckIsNullOrEmpty(worksheet.Cells[row, headerMap["aadhar number"]].Text),
                                        EmployeeStatus = "Active",
                                        CreatedBy = UserEmailId!
                                    };
                                    employees.Add(employee);
                                }
                            }
                        }
                    }
                }

                var validRecords = employees
                    .Where(e => !duplicateRecords.Contains((e.Email.ToLower().Trim(), e.Code.ToString())))
                    .ToList();

                // If import is not confirmed, return validation results without inserting into DB
                if (!importConfirmed)
                {
                    var response = new
                    {
                        validRecordsCount = validRecords.Count,

                        duplicateCount = duplicateRecords.Count,
                        duplicateRecords = duplicateRecords.Select(e => new { email = e.email, code = e.code }).ToList(),

                        invalidCount = invalidRecords.Count,
                        invalidRecords = invalidRecords.Select(e => new { row = e.Row, reason = e.Reason }).ToList()
                    };
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, JsonSerializer.Serialize(response), CrudResult.Success);
                }

                if (validRecords.Any())
                {

                    var bankDetailsList = _mapper.Map<List<BankDetails>>(validRecords);
                    var employmentDetailsList = _mapper.Map<List<EmploymentDetail>>(validRecords);
                    var employeeDetailsList = _mapper.Map<List<EmployeeData>>(validRecords);
                    var addressList = _mapper.Map<List<Address>>(validRecords);
                    var permanentAddressList = _mapper.Map<List<PermanentAddress>>(validRecords);

                    var res = await _unitOfWork.UserProfileRepository.InsertUpdateExcelEmployeesData(employeeDetailsList, bankDetailsList, addressList, permanentAddressList, employmentDetailsList);

                    if (res > 0)
                    {
                        string msg = $"{res} records successfully imported.";
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, msg, CrudResult.Success);
                    }
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, "No valid records to import.", CrudResult.Failed);
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, "Error", CrudResult.Failed);
            }
        }

        public async Task<byte[]> ExportEmployeeListToExcel(SearchRequestDto<EmployeeSearchRequestDto> employeeSearchRequestDto)
        {
            var employeeList = await _unitOfWork.UserProfileRepository.GetEmployerList(employeeSearchRequestDto);
            return _unitOfWork.UserProfileRepository.GenerateExcelFile(employeeList.EmployeeList);
        }

        public async Task<ApiResponseModel<IEnumerable<DesignationResponseDto>>> GetDesignationList()
        {
            var designationList = await _unitOfWork.UserProfileRepository.GetDesignationList();
            if (designationList != null && designationList.Any())
            {
                return new ApiResponseModel<IEnumerable<DesignationResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, designationList);
            }
            return new ApiResponseModel<IEnumerable<DesignationResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
        }
        public async Task<ApiResponseModel<DepartmentResponseDto>> GetDepartmentById(long id)
        {
            var response = await _unitOfWork.UserProfileRepository.GetDepartmentById(id);
            if (response != null)
            {
                return new ApiResponseModel<DepartmentResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<DepartmentResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }
        public async Task<ApiResponseModel<TeamResponseDto>> GetTeamById(long id)
        {
            var response = await _unitOfWork.UserProfileRepository.GetTeamByIdAsync(id);
            if (response != null)
            {
                return new ApiResponseModel<TeamResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<TeamResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<DepartmentSearchResponseDto>> GetDepartment(SearchRequestDto<DepartmentSearchRequestDto> departmentSearchRequestDto)
        {

            var response = await _unitOfWork.UserProfileRepository.GetDepartment(departmentSearchRequestDto);
            if (response != null && response.DepartmentList.Any())
            {
                return new ApiResponseModel<DepartmentSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            return new ApiResponseModel<DepartmentSearchResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
        }
        public async Task<ApiResponseModel<TeamSearchResponseDto>> GetTeams(SearchRequestDto<TeamSearchRequestDto> departmentSearchRequestDto)
        {

            var response = await _unitOfWork.UserProfileRepository.GetTeams(departmentSearchRequestDto);
            if (response != null && response.TeamList.Any())
            {
                return new ApiResponseModel<TeamSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            return new ApiResponseModel<TeamSearchResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
        }
        public async Task<ApiResponseModel<CrudResult>> AddDesignation(DesignationRequestDto request)
        {
            if (request == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }else
            {
                request.Designation = string.IsNullOrEmpty(request.Designation) ? "" : request.Designation.Trim();
                if (string.IsNullOrEmpty(request.Designation))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.ValidDesignation, CrudResult.Failed);
                }
                var existDesignations = await _unitOfWork.UserProfileRepository.GetDesignationByName(request.Designation);
                if (existDesignations != null && !string.IsNullOrEmpty(existDesignations.Name))
                {
                    if (!existDesignations.Status)
                    {
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.ActiveDesignationExist, CrudResult.Failed);
                    }
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.DeactivatedDesignationExist, CrudResult.Failed);
                }

                var designationDto = _mapper.Map<Designation>(request);

                designationDto.CreatedBy = UserEmailId!;
                designationDto.CreatedOn = DateTime.UtcNow;

                var response = await _unitOfWork.UserProfileRepository.AddDesignation(designationDto);
                if (response != null)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.DesignationAdded, CrudResult.Success);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.DesignationIsNotSaved, CrudResult.Failed);
            }
           

        }
        public async Task<ApiResponseModel<DesignationResponseDto>> GetDesignationById(long id)
        {
            var response = await _unitOfWork.UserProfileRepository.GetDesignationById(id);
            if (response != null)
            {
                return new ApiResponseModel<DesignationResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<DesignationResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }
        public async Task<ApiResponseModel<CrudResult>> EditDesignation(DesignationRequestDto request)
        {
            if (request == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            else
            {
                request.Designation = string.IsNullOrEmpty(request.Designation) ? "" : request.Designation.Trim();
                if (string.IsNullOrEmpty(request.Designation))
                { 
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.ValidDesignation, CrudResult.Failed);
                } 
                var existDesignations = await _unitOfWork.UserProfileRepository.GetDesignationByName(request.Designation);
                if (existDesignations != null && !string.IsNullOrEmpty(existDesignations.Name))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.ActiveDesignationExist, CrudResult.Failed);
                }
                var departmentResponse = await _unitOfWork.UserProfileRepository.GetDesignationById(request.Id);
                if (departmentResponse != null )
                {
                    var designationDto = _mapper.Map<Designation>(request);
                    designationDto.CreatedBy = UserEmailId!;
                    designationDto.CreatedOn = DateTime.UtcNow;
                    
                    await _unitOfWork.UserProfileRepository.UpdateDesignation(designationDto);
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.UpdatedDesignation, CrudResult.Success);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
        }
        public async Task<ApiResponseModel<DesignationSearchResponseDto>> GetDesignation(SearchRequestDto<DesignationSearchRequestDto> designationSearchRequestDto)
        {

            var response = await _unitOfWork.UserProfileRepository.GetDesignation(designationSearchRequestDto);
            if (response != null && response.DesignationList.Any())
            {
                return new ApiResponseModel<DesignationSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            return new ApiResponseModel<DesignationSearchResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
        }
        /// <summary>
        /// Funtion to get latest employee code
        /// </summary>
        /// <returns></returns>
        public async Task<ApiResponseModel<string>> GetLatestEmpCode()
        {                                                                                                   //Need to chage function emp code
            string latestEmpCode = await _unitOfWork.UserProfileRepository.GetLatestEmpCode();
            if (latestEmpCode != null)
            {
                return new ApiResponseModel<string>((int)HttpStatusCode.OK, SuccessMessage.Success, latestEmpCode);
            }
            else
            {
                return new ApiResponseModel<string>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }
        /// <summary>
        /// Funtion to get personal detail for profile
        /// </summary>
        /// <returns></returns>
        public async Task<ApiResponseModel<PersonalProfileDetailsResponseDto>> GetPersonalProfileByIdAsync(long id)
        {
            var personalDetailsResponse = await _unitOfWork.UserProfileRepository.GetPersonalProfileByIdAsync(id);
            if (personalDetailsResponse != null)
            {
                var request = _httpContextAccessor.HttpContext.Request;
                personalDetailsResponse.FileName = !string.IsNullOrWhiteSpace(personalDetailsResponse.FileName) ? $"{request.Scheme}://{request.Host}/Images/ProfileImage/{personalDetailsResponse.FileName}" : "";
                 
                return new ApiResponseModel<PersonalProfileDetailsResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, personalDetailsResponse);
            }
            else
            {
                return new ApiResponseModel<PersonalProfileDetailsResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, null);
            }
        }
    }
}
