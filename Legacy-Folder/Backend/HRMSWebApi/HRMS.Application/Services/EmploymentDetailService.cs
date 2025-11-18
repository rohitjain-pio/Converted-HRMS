using AutoMapper;
using HRMS.Application.Clients;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain;
using HRMS.Domain.Configurations;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Domain.Utility;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Net;
using System.Text.Json;

namespace HRMS.Application.Services
{
    public class EmploymentDetailService : TokenService, IEmploymentDetailService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly AppConfigOptions _appConfig;
       
        private readonly BlobStorageClient _blobStorageClient;
       
        private readonly TimeDoctorClient _timeDoctorClient;
        private readonly LeavesAccrualOptions _leavesAccrualOptions;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IEmailNotificationService _email;
        public EmploymentDetailService(IUnitOfWork unitOfWork, IMapper mapper, IOptions<AppConfigOptions> appConfig, IOptions<LeavesAccrualOptions> leavesAccrualOptions, BlobStorageClient blobStorageClient, IHttpContextAccessor httpContextAccessor, TimeDoctorClient timeDoctorClient, IEmailNotificationService email) : base(httpContextAccessor)

        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _appConfig = appConfig.Value;
            _blobStorageClient = blobStorageClient;
            _timeDoctorClient = timeDoctorClient;
            _leavesAccrualOptions = leavesAccrualOptions.Value;
            _httpContextAccessor = httpContextAccessor;
            _email = email;
        }

        public async Task<ApiResponseModel<string?>> GetEmployeeTimedoctorUserId(string email)
        {
            if (string.IsNullOrWhiteSpace(email)) return new ApiResponseModel<string?>((int)HttpStatusCode.BadRequest, ErrorMessage.EmailIsRequired, null);
            var tdId = await _timeDoctorClient.GetTimeDoctorUserIdByEmail(email.Trim());
            if (string.IsNullOrWhiteSpace(tdId)) return new ApiResponseModel<string?>((int)HttpStatusCode.NotFound, ErrorMessage.TimeDoctorUserIdNotFound, null);
            return new ApiResponseModel<string?>((int)HttpStatusCode.OK, SuccessMessage.Success, tdId);
        }

        public async Task<ApiResponseModel<CrudResult>> AddEmploymentDetail(AddEmploymentDetailRequestDto request)
        {
            if (request == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            if (!(await _unitOfWork.EmploymentDetailRepository.IsEmailExists(request.Email)))
            {
                if (await _unitOfWork.EmploymentDetailRepository.IsEmpCodeExist(request.EmployeeCode))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Ambiguous, ErrorMessage.EmpCodeAlreadyExist, CrudResult.Failed);
                }
                var timedoctorUserId = (await GetEmployeeTimedoctorUserId(request.Email)).Result;

                var employmentDetail = _mapper.Map<EmploymentDetail>(request);
                var employeeData = _mapper.Map<EmployeeData>(request);

                employmentDetail.CreatedBy = UserEmailId!;
                employeeData.CreatedBy = UserEmailId!;
                employmentDetail.CreatedOn = DateTime.UtcNow;
                employeeData.CreatedOn = DateTime.UtcNow;
                employmentDetail.EmployeeStatus = EmployeeStatus.Active;
                employmentDetail.RoleId = Roles.Employee;
                employmentDetail.TimeDoctorUserId = timedoctorUserId;

                var empId = await _unitOfWork.EmploymentDetailRepository.AddEmploymentDetailAsync(employmentDetail, employeeData);
                if (empId > 0)
                {
                    await _unitOfWork.AttendanceRepository.UpdateAttendanceConfigAsync(new()
                    {
                        EmployeeId = empId,
                        IsManualAttendance = string.IsNullOrEmpty(timedoctorUserId)
                    });
                }
                var gender = await _unitOfWork.UserProfileRepository.GetUserGender(empId);
                 
                var leaveBalance = LeaveBalanceHelper.GetOpeningBalance(request.JoiningDate.ToDateTime(TimeOnly.MinValue), _leavesAccrualOptions, gender);
                await _unitOfWork.EmploymentDetailRepository.AddIfNotExistsEmployeeOpeningLeaveBalance(empId, leaveBalance);


                await _email.AddWelcomeEmailAsync(request.Email);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.EmploymentAdded, CrudResult.Success);
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Ambiguous, ErrorMessage.EmailAlreadyExist, CrudResult.Failed);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> UpdateEmploymentDetail(EmploymentRequestDto request)
        {
            if (request == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            if (request.Id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, CrudResult.Failed);
            }
            var employmentDetail = _mapper.Map<EmploymentDetail>(request);
            employmentDetail.ModifiedBy = UserEmailId!;
            employmentDetail.ModifiedOn = DateTime.UtcNow;
            var employmentResponseDto = await _unitOfWork.EmploymentDetailRepository.GetEmplyementDetailByIdAsync(request.EmployeeId);
            if (employmentResponseDto == null) return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            employmentDetail.TimeDoctorUserId = employmentResponseDto.TimeDoctorUserId;
            if (employmentResponseDto.EmploymentStatus == EmploymentStatus.Internship && request.EmploymentStatus == EmploymentStatus.FullTime)
            {
                await _unitOfWork.UserProfileRepository.GetLatestEmpCode(); 
            }
            int result = await _unitOfWork.EmploymentDetailRepository.UpdateEmploymentDetailAsync(employmentDetail);
            if (string.IsNullOrEmpty(employmentResponseDto.TimeDoctorUserId))
            {
                var timedoctorUserId = (await GetEmployeeTimedoctorUserId(request.Email)).Result;
                await _unitOfWork.AttendanceRepository.UpdateTimeDoctorUserId(request.EmployeeId, timedoctorUserId);
                await _unitOfWork.AttendanceRepository.UpdateAttendanceConfigAsync(new()
                {
                    EmployeeId = request.EmployeeId,
                    IsManualAttendance = string.IsNullOrEmpty(timedoctorUserId) ? true : employmentResponseDto.IsManualAttendance,
                });
            }
            if (employmentDetail.JoiningDate != null)
            {
                var gender = await _unitOfWork.UserProfileRepository.GetUserGender(request.EmployeeId);
                var leaveBalance = LeaveBalanceHelper.GetOpeningBalance(employmentDetail.JoiningDate.Value.ToDateTime(TimeOnly.MinValue), _leavesAccrualOptions, gender);
                await _unitOfWork.EmploymentDetailRepository.AddIfNotExistsEmployeeOpeningLeaveBalance(request.EmployeeId, leaveBalance);
            }
            if (result > 0)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.EmploymentUpdate, CrudResult.Success);

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.RecordNotUpdated, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<CrudResult>> ArchiveUnarchiveEmploymentDetails(EmployeeArchiveRequestDto employeeArchiveRequestDto)
        {
            var EmploymentDetailsResponse = await _unitOfWork.UserProfileRepository.GetEmployerDetailIdAsync(employeeArchiveRequestDto.Id);
            if (EmploymentDetailsResponse != null && EmploymentDetailsResponse.Any())
            {
                await _unitOfWork.EmploymentDetailRepository.ArchiveUnarchiveEmploymentDetails(employeeArchiveRequestDto);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<EmploymentResponseDto>> GetEmplyementDetailById(long id)
        {
            var employmentResponseDto = await _unitOfWork.EmploymentDetailRepository.GetEmplyementDetailByIdAsync(id);
         
            if (employmentResponseDto != null)
            {
                employmentResponseDto.professionalReferences = employmentResponseDto.ProfessionalReferenceJson != null ? JsonSerializer.Deserialize<List<ProfessionalReferenceResponseDto>>(employmentResponseDto.ProfessionalReferenceJson) : employmentResponseDto.professionalReferences;
                return new ApiResponseModel<EmploymentResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, employmentResponseDto);
            }
            else
            {
                return new ApiResponseModel<EmploymentResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> UploadCurrentEmployerDocument(CurrentEmployerDocRequestDto employerDocRequestDto)
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
            if (await _unitOfWork.UserProfileRepository.ValidateEmployeeIdAsync(employerDocRequestDto.EmployeeId))
            {
                string fileName = await _blobStorageClient.UploadFile(employerDocRequestDto.File, employerDocRequestDto.EmployeeId, BlobContainerConstants.EmployerDocumentContainer);
                if (!string.IsNullOrEmpty(fileName))
                {
                    var currentEmployer = _mapper.Map<CurrentEmployerDocument>(employerDocRequestDto);
                    currentEmployer.EmployeeDocumentTypeId = employerDocRequestDto.EmployeeDocumentTypeId;
                    currentEmployer.FileName = fileName;
                    currentEmployer.FileOriginalName = employerDocRequestDto.File.FileName;
                    currentEmployer.CreatedOn = DateTime.UtcNow;
                    currentEmployer.CreatedBy = UserEmailId!;
                    var response = await _unitOfWork.EmploymentDetailRepository.SaveCurrentEmployerDocument(currentEmployer);
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

        public async Task<ApiResponseModel<IEnumerable<EmployerDocumentTypeResponseDto>>> GetEmployerDocumentTypeList(int documentFor)
        {
            var documentTypes = await _unitOfWork.EmploymentDetailRepository.GetEmployerDocumentTypeList(documentFor);
            if (documentTypes != null && documentTypes.Any())
            {
                var documentTypesListDto = _mapper.Map<List<EmployerDocumentTypeResponseDto>>(documentTypes);

                return new ApiResponseModel<IEnumerable<EmployerDocumentTypeResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, documentTypesListDto);
            }
            else
            {
                return new ApiResponseModel<IEnumerable<EmployerDocumentTypeResponseDto>>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }
        public async Task<ApiResponseModel<CrudResult>> DeleteEmploymentDetails(long id)
        {
            if (id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, CrudResult.Failed);
            }

            var EmploymentDetailsResponse = await _unitOfWork.EmploymentDetailRepository.GetByIdAsync(id);
            if (EmploymentDetailsResponse != null)
            {
                EmploymentDetail employmentDetail = new();
                employmentDetail.Id = id;
                employmentDetail.EmployeeId = EmploymentDetailsResponse.EmployeeId;
                employmentDetail.ModifiedBy = UserEmailId;
                employmentDetail.ModifiedOn = DateTime.UtcNow;
                await _unitOfWork.EmploymentDetailRepository.DeleteAsync(employmentDetail);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.EmploymentDelete, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }
        public async Task<ApiResponseModel<CrudResult>> ArchiveUnarchiveDepartment(DepartmentArchiveRequestDto departmentArchiveRequestDto)
        {
            var departmentResponse = await _unitOfWork.UserProfileRepository.GetDepartmentById(departmentArchiveRequestDto.Id);
            if (departmentResponse != null)
            {
                await _unitOfWork.EmploymentDetailRepository.ArchiveUnarchiveDepartment(departmentArchiveRequestDto);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }
        public async Task<ApiResponseModel<CrudResult>> ArchiveUnarchiveTeam(ArchiveTeamRequestDto teamArchiveRequestDto)
        {
            var teamResponse = await _unitOfWork.UserProfileRepository.GetTeamByIdAsync(teamArchiveRequestDto.Id);
            if (teamResponse != null)
            {
                await _unitOfWork.EmploymentDetailRepository.ArchiveUnarchiveTeam(teamArchiveRequestDto);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }
        public async Task<ApiResponseModel<CrudResult>> ArchiveUnarchiveDesignation(DesignationArchiveRequestDto designationArchiveRequest)
        {
            var designationResponse = await _unitOfWork.UserProfileRepository.GetDesignationById(designationArchiveRequest.Id);
            if (designationResponse != null)
            {
                await _unitOfWork.EmploymentDetailRepository.ArchiveUnarchiveDesignation(designationArchiveRequest);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }
        public async Task<ApiResponseModel<EmploymentDetailsForDwnTwn>> GetEmplyementDetails(string email)
        {
            var employmentResponseDto = await _unitOfWork.EmploymentDetailRepository.GetEmplyementDetailAsync(email);

            if (employmentResponseDto != null)
            {
                var request = _httpContextAccessor.HttpContext.Request;
            
                employmentResponseDto.EducationalDetailLst = !string.IsNullOrEmpty(employmentResponseDto.EducationalDetailJson)
                        ? JsonSerializer.Deserialize<List<EducationalDetailForDwnTwn>>(employmentResponseDto.EducationalDetailJson)
                        : employmentResponseDto.EducationalDetailLst;

                employmentResponseDto.PreviousEmployerDetailLst = !string.IsNullOrEmpty(employmentResponseDto.PreviousEmployerDetailJson)
                        ? JsonSerializer.Deserialize<List<PreviousEmployerRequestDto>>(employmentResponseDto.PreviousEmployerDetailJson)
                        : employmentResponseDto.PreviousEmployerDetailLst;

                employmentResponseDto.FileName = !string.IsNullOrWhiteSpace(employmentResponseDto.FileName) ? $"{request.Scheme}://{request.Host}/Images/ProfileImage/{employmentResponseDto.FileName}" : "";
                     

                return new ApiResponseModel<EmploymentDetailsForDwnTwn>(
                    (int)HttpStatusCode.OK,
                    SuccessMessage.Success,
                    employmentResponseDto
                );
            }
            else
            {
                return new ApiResponseModel<EmploymentDetailsForDwnTwn>(
                    (int)HttpStatusCode.NotFound,
                    ErrorMessage.NotFoundMessage,
                    null
                );
            }
        }

    }
}