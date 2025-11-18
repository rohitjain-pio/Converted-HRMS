using HRMS.Domain.Entities;
using HRMS.Models.Models.UserProfile;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using HRMS.Models;
using System.Net;
using AutoMapper;
using HRMS.Application.Clients;
using HRMS.Infrastructure;
using Microsoft.AspNetCore.Http;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.AdminExitEmployee;

namespace HRMS.Application.Services
{
    public class AdminExitEmployeeService : TokenService, IAdminExitEmployeeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly BlobStorageClient _blobStorageClient;
        private readonly IEmailNotificationService _email;


        public AdminExitEmployeeService(IUnitOfWork unitOfWork, IMapper mapper, BlobStorageClient blobStorageClient, IHttpContextAccessor httpContextAccessor, IEmailNotificationService email)
            : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _blobStorageClient = blobStorageClient;
            _email = email;
        }

        public async Task<ApiResponseModel<ExitEmployeeListResponseDTO>> GetResignationList(SearchRequestDto<ResignationSearchRequestDto> requestDto)
        {
            var resignations = await _unitOfWork.AdminExitEmployeeRepository.GetAllResignationsAsync(requestDto);
            return new ApiResponseModel<ExitEmployeeListResponseDTO>((int)HttpStatusCode.OK, SuccessMessage.Success, resignations);
        }
        public async Task<ApiResponseModel<AdminExitEmployeeResponseDto>> GetResignationById(int id)
        {
            AdminExitEmployeeResponseDto resignationDetail = await _unitOfWork.AdminExitEmployeeRepository.GetResignationByIdAsync(id);

            if (resignationDetail != null)
            {
                return new ApiResponseModel<AdminExitEmployeeResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, resignationDetail);
            }
            else
            {
                return new ApiResponseModel<AdminExitEmployeeResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<String>> AdminAcceptResignation(int id)
        {
            var resignationRequestDto = new Resignation()
            {
                Id = id,
                ResignationStatus = ResignationStatus.Accepted
            };
            var resignationHistory = new ResignationHistory()
            {
                ResignationId = id
            };
            resignationHistory.CreatedBy = UserEmailId!;
            resignationHistory.CreatedOn = DateTime.UtcNow;
            var response = await _unitOfWork.AdminExitEmployeeRepository.AdminAcceptResignationAsync(resignationRequestDto, resignationHistory);

            if (response != null)
            {
                //Sending Email for Accept Resignation
                await _email.AddResignationApprovedEmailAsync(id);
                return new ApiResponseModel<String>((int)HttpStatusCode.OK, SuccessMessage.AcceptResignation, response);
            }
            else
            {

                return new ApiResponseModel<String>((int)HttpStatusCode.NotFound, ErrorMessage.ResignationRejected, null);
            }
        }

        public async Task<ApiResponseModel<String>> AdminAcceptEarlyRelease(AcceptEarlyReleaseRequestDto requestDto)
        {
            var resignationHistory = _mapper.Map<ResignationHistory>(requestDto);
            resignationHistory.CreatedBy = UserEmailId!;
            resignationHistory.CreatedOn = DateTime.UtcNow;
            resignationHistory.ResignationStatus = ResignationStatus.Accepted;
            var response = await _unitOfWork.AdminExitEmployeeRepository.AdminAcceptEarlyReleaseAsync(requestDto, resignationHistory);

            if (response != null)
            {
                //Email Service for Early release approved 
                await _email.EarlyReleaseApproved(requestDto.ResignationId , true);
                return new ApiResponseModel<String>((int)HttpStatusCode.OK, SuccessMessage.AcceptEarlyRelease, response);
            }
            else
            {
                return new ApiResponseModel<String>((int)HttpStatusCode.NotFound, ErrorMessage.ResignationNotExist, null);
            }


        }

        public async Task<ApiResponseModel<string>> AdminRejectRequest(AdminRejectionRequestDto requestDto)
        {
            var resignationHistory = _mapper.Map<ResignationHistory>(requestDto);
            resignationHistory.CreatedBy = UserEmailId!;
            resignationHistory.CreatedOn = DateTime.UtcNow;


            string? response = null;
            switch (requestDto.RejectionType.ToLower())
            {
                case "resignation":
                    resignationHistory.ResignationStatus = ResignationStatus.Cancelled;
                    response = await _unitOfWork.AdminExitEmployeeRepository.AdminRejectResignationAsync(requestDto, resignationHistory);

                    if (response != null)
                    {
                        //sending email for Reject Resignation 
                        await _email.ResignationRejected(requestDto.ResignationId);
                        return new ApiResponseModel<string>((int)HttpStatusCode.OK, SuccessMessage.RejectResignation, response);
                    }
                    return new ApiResponseModel<string>((int)HttpStatusCode.NotFound, ErrorMessage.ResignationNotFound, null);

                case "earlyrelease":
                    resignationHistory.EarlyReleaseStatus = EarlyReleaseStatus.Rejected;
                    response = await _unitOfWork.AdminExitEmployeeRepository.AdminRejectEarlyReleaseAsync(requestDto, resignationHistory);
                    if (response != null)
                    {
                        //email service for rejection 
                        await _email.EarlyReleaseApproved(requestDto.ResignationId, false);
                        return new ApiResponseModel<string>((int)HttpStatusCode.OK, SuccessMessage.RejectEarlyRelease, response);
                    }
                    return new ApiResponseModel<string>((int)HttpStatusCode.NotFound, ErrorMessage.ResignationNotFound, null);

                default:
                    return new ApiResponseModel<string>((int)HttpStatusCode.NotFound, ErrorMessage.ResignationNotFound, null);
            }
        }
        public async Task<ApiResponseModel<string>> UpdateLastWorkingDay(UpdateLastWorkingDayRequestDto requestDto)
        {
            var resignation = await _unitOfWork.AdminExitEmployeeRepository.GetResignationByIdAsync(requestDto.ResignationId);
            if (resignation == null)
                return new ApiResponseModel<String>((int)HttpStatusCode.NotFound, ErrorMessage.ResignationNotFound, null);

            var response = await _unitOfWork.AdminExitEmployeeRepository.UpdateLastWorkingDayAsync(requestDto);
            if (response == null)
                return new ApiResponseModel<String>((int)HttpStatusCode.NotFound, ErrorMessage.ResignationNotFound, null);

            return new ApiResponseModel<String>((int)HttpStatusCode.OK, SuccessMessage.UpdatedLastWorkingDay, response);
        }

        public async Task<ApiResponseModel<ITClearanceResponseDTO>> GetITClearanceDetailByResignationId(int resignationId)
        {
            var ITClearanceDetail = await _unitOfWork.AdminExitEmployeeRepository.GetITClearanceByResignationIdAsync(resignationId);

            if (ITClearanceDetail != null)
            {
                var response = _mapper.Map<ITClearanceResponseDTO>(ITClearanceDetail);
                return new ApiResponseModel<ITClearanceResponseDTO>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<ITClearanceResponseDTO>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }


        public async Task<ApiResponseModel<CrudResult>> AddUpdateITClearanceById(ITClearanceRequestDTO requestDTO)
        {
            if (requestDTO == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(requestDTO.EmployeeId);
            if (userResponse != null)
            {
                var itClearance = _mapper.Map<ITClearance>(requestDTO);
                string fileName = string.Empty;
                if (requestDTO.AttachmentUrl != null && !string.IsNullOrEmpty(requestDTO.AttachmentUrl.FileName))
                {
                    fileName = await _blobStorageClient.UploadFile(requestDTO.AttachmentUrl, requestDTO.EmployeeId, BlobContainerConstants.UserDocumentContainer);
                    itClearance.FileOriginalName = requestDTO.AttachmentUrl.FileName;
                }
                itClearance.AttachmentUrl = fileName;
                itClearance.CreatedBy = UserEmailId!;
                itClearance.CreatedOn = DateTime.UtcNow;
                itClearance.ModifiedBy = UserEmailId!;

                var result = await _unitOfWork.AdminExitEmployeeRepository.AddUpdateITClearanceAsync(itClearance);
                if (result)
                {
                    await _email.ITClearance(requestDTO);
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                else
                {
                    if (!string.IsNullOrEmpty(fileName))
                    {
                        await _blobStorageClient.DeleteFile(fileName, BlobContainerConstants.UserDocumentContainer);
                    }
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorDocumentInfoInDB, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.UserNotExist, CrudResult.Failed);
            }
        }


        public async Task<ApiResponseModel<AccountClearanceResponseDTO>> GetAccountClearanceById(int resignationId)
        {

            var AccountClearanceDetail = await _unitOfWork.AdminExitEmployeeRepository.GetAccountClearanceByResignationIdAsync(resignationId);

            if (AccountClearanceDetail != null)
            {
                var response = _mapper.Map<AccountClearanceResponseDTO>(AccountClearanceDetail);
                return new ApiResponseModel<AccountClearanceResponseDTO>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<AccountClearanceResponseDTO>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> AddUpdateAccountClearanceById(AccountClearanceRequestDto requestDto)
        {

            if (requestDto == null)

            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            string fileName = string.Empty;
            if (requestDto.AccountAttachment != null && !string.IsNullOrEmpty(requestDto.AccountAttachment.FileName))

            {
                fileName = await _blobStorageClient.UploadFile(requestDto.AccountAttachment, requestDto.EmployeeId, BlobContainerConstants.UserDocumentContainer);
            }
            var accountClearance = _mapper.Map<AccountClearance>(requestDto);
            accountClearance.AccountAttachment = fileName;
            accountClearance.CreatedBy = UserEmailId!;
            accountClearance.CreatedOn = DateTime.UtcNow;
            accountClearance.ModifiedBy = UserEmailId!;

            if (requestDto.AccountAttachment != null && !string.IsNullOrEmpty(requestDto.AccountAttachment.FileName))
            {
                accountClearance.FileOriginalName = requestDto.AccountAttachment.FileName;
            }

            var result = await _unitOfWork.AdminExitEmployeeRepository.AddUpdateAccountClearanceAsync(accountClearance);

            if (result)
            {
                await _email.AccountClearance(requestDto.ResignationId, requestDto.IssueNoDueCertificate , requestDto.FnFStatus);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }

            else
            {
                if (!string.IsNullOrEmpty(fileName))
                {
                    await _blobStorageClient.DeleteFile(fileName, BlobContainerConstants.UserDocumentContainer);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorDocumentInfoInDB, CrudResult.Failed);
            }

        }


        public async Task<ApiResponseModel<HRClearanceResponseDto>> GetHRClearanceByResignationId(int resignationId)
        {
            var hrClearanceDetail = await _unitOfWork.AdminExitEmployeeRepository.GetHRClearanceByResignationIdAsync(resignationId);

            if (hrClearanceDetail != null)
            {
                var response = _mapper.Map<HRClearanceResponseDto>(hrClearanceDetail);
                return new ApiResponseModel<HRClearanceResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<HRClearanceResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }


        public async Task<ApiResponseModel<DepartmentClearanceResponseDto>> GetDepartmentClearanceByResignationId(int resignationId)
        {
            var departmentClearanceDetail = await _unitOfWork.AdminExitEmployeeRepository.GetDepartmentClearanceByResignationIdAsync(resignationId);

            if (departmentClearanceDetail != null)
            {
                var response = _mapper.Map<DepartmentClearanceResponseDto>(departmentClearanceDetail);
                return new ApiResponseModel<DepartmentClearanceResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<DepartmentClearanceResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }


        public async Task<ApiResponseModel<CrudResult>> UpsertDepartmentClearance(DepartmentClearanceRequestDto requestDto)
        {

            if (requestDto == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }

            var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(requestDto.EmployeeId);
            if (userResponse != null)
            {
                var departmentClearance = _mapper.Map<DepartmentClearance>(requestDto);
                string fileName = string.Empty;
                if (requestDto.Attachment != null && !string.IsNullOrEmpty(requestDto.Attachment.FileName))
                {
                    fileName = await _blobStorageClient.UploadFile(requestDto.Attachment, requestDto.EmployeeId, BlobContainerConstants.UserDocumentContainer);
                    departmentClearance.FileOriginalName = requestDto.Attachment.FileName;
                }
                departmentClearance.Attachment = fileName;
                departmentClearance.CreatedBy = UserEmailId!;
                departmentClearance.CreatedOn = DateTime.UtcNow;
                var result = await _unitOfWork.AdminExitEmployeeRepository.UpsertDepartmentClearanceAsync(departmentClearance);
                if (result)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                else
                {
                    if (!string.IsNullOrEmpty(fileName))
                    {
                        await _blobStorageClient.DeleteFile(fileName, BlobContainerConstants.UserDocumentContainer);
                    }

                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorDocumentInfoInDB, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.UserNotExist, CrudResult.Failed);
            }
        }
        public async Task<ApiResponseModel<CrudResult>> UpsertHRClearance(HRClearanceRequestDto requestDto)
        {
            if (requestDto == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }

            var userResponse = await _unitOfWork.AuthRepository.GetByIdAsync(requestDto.EmployeeId);
            if (userResponse != null)
            {
                var hrClearance = _mapper.Map<HRClearance>(requestDto);
                string fileName = string.Empty;

                if (requestDto.Attachment != null && !string.IsNullOrEmpty(requestDto.Attachment.FileName))
                {
                    fileName = await _blobStorageClient.UploadFile(requestDto.Attachment, requestDto.EmployeeId, BlobContainerConstants.UserDocumentContainer);
                    hrClearance.FileOriginalName = requestDto.Attachment.FileName;
                }

                hrClearance.Attachment = fileName;
                hrClearance.CreatedBy = UserEmailId!;
                hrClearance.CreatedOn = DateTime.UtcNow;

                var result = await _unitOfWork.AdminExitEmployeeRepository.UpsertHRClearanceAsync(hrClearance);
                if (result)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                else
                {
                    if (!string.IsNullOrEmpty(fileName))
                    {
                        await _blobStorageClient.DeleteFile(fileName, BlobContainerConstants.UserDocumentContainer);
                    }

                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.ErrorDocumentInfoInDB, CrudResult.Failed);
                }
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.UserNotExist, CrudResult.Failed);
            }
        }
    }
}
