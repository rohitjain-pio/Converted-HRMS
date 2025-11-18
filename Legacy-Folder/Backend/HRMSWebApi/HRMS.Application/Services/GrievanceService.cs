using AutoMapper;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using HRMS.Models.Models.Grievance;
using HRMS.Models;
using Microsoft.AspNetCore.Http;
using System.Net;
using HRMS.Application.Services.Interfaces;
using HRMS.Application.Clients;
using OfficeOpenXml;



namespace HRMS.Application.Services
{
    public class GrievanceService : TokenService, IGrievanceService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly BlobStorageClient _blobStorageClient;
        private readonly IEmailNotificationService _email;
        private readonly IHttpContextAccessor _httpContextAccessor;


        public GrievanceService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor, BlobStorageClient blobStorageClient, IEmailNotificationService email) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _blobStorageClient = blobStorageClient;
            _email = email;
            _httpContextAccessor = httpContextAccessor;

        }

        public async Task<ApiResponseModel<CrudResult>> AddGrievance(GrievanceRequestDTO request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.GrievanceName))
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NameIsRequired, CrudResult.Failed);
                }

                var grievanceType = new GrievanceType
                {
                    GrievanceName = request.GrievanceName,
                    Description = request.Description ?? string.Empty,
                    L1TatHours = request.L1TatHours,
                    L2TatHours = request.L2TatHours,
                    L3TatDays = request.L3TatDays,
                    IsActive = true,
                    IsAutoEscalation = request.IsAutoEscalation,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = UserEmailId!
                };


                var grievanceTypeId = await _unitOfWork.GrievanceRepository.AddGrievanceTypeAsync(grievanceType);

                // Process owners for each level
                await AddGrievanceOwners(grievanceTypeId, 1, request.L1OwnerIds);
                await AddGrievanceOwners(grievanceTypeId, 2, request.L2OwnerIds);
                await AddGrievanceOwners(grievanceTypeId, 3, request.L3OwnerIds);


                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, $"{ErrorMessage.GrievanceCouldNotAdded} {ex.Message}", CrudResult.Failed);
            }
        }


        private async Task AddGrievanceOwners(long grievanceTypeId, byte level, string ownerIds)
        {
            if (string.IsNullOrEmpty(ownerIds))
                return;

            var ownerIdList = ownerIds.Split(',').Distinct().ToList();
            foreach (var ownerId in ownerIdList)
            {
                if (!string.IsNullOrWhiteSpace(ownerId) && int.TryParse(ownerId, out int parsedOwnerId))
                {
                    var grievanceOwner = new GrievanceOwner
                    {
                        GrievanceTypeId = grievanceTypeId,
                        IsDeleted = false,
                        Level = level,
                        OwnerID = parsedOwnerId,
                        CreatedOn = DateTime.UtcNow,
                        CreatedBy = UserEmailId!
                    };
                    await _unitOfWork.GrievanceRepository.AddGrievanceOwnerAsync(grievanceOwner);
                }
            }
        }


        public async Task<ApiResponseModel<CrudResult>> DeleteGrievance(long grievanceTypeId)
        {
            var response = await _unitOfWork.GrievanceRepository.GetGrievanceTypeByIdAsync(grievanceTypeId);
            if (response == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, ErrorMessage.TypeNotExist, CrudResult.Success);
            }
            var request = new GrievanceType();
            request.Id = grievanceTypeId;
            request.ModifiedBy = UserEmailId;
            request.ModifiedOn = DateTime.UtcNow;
            await _unitOfWork.GrievanceRepository.DeleteGrievanceAsync(request);
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.GrievanceDeleted, CrudResult.Success);
        }


        public async Task<ApiResponseModel<GrievanceListResponseDTO>> GetAllGrievances()
        {
            var grievances = await _unitOfWork.GrievanceRepository.GetAllGrievancesAsync();
            var processedGrievances = grievances.GrievanceList.Select(g => new GrievanceResponseDTO
            {
                Id = g.Id,
                GrievanceName = g.GrievanceName,
                Description = g.Description,
                L1TatHours = g.L1TatHours,
                L1OwnerId = RemoveDuplicateIds(g.L1OwnerId),
                L1OwnerName = RemoveDuplicateNames(g.L1OwnerName, g.L1OwnerId),
                L2TatHours = g.L2TatHours,
                L2OwnerId = RemoveDuplicateIds(g.L2OwnerId),
                L2OwnerName = RemoveDuplicateNames(g.L2OwnerName, g.L2OwnerId),
                L3TatDays = g.L3TatDays,
                L3OwnerId = RemoveDuplicateIds(g.L3OwnerId),
                L3OwnerName = RemoveDuplicateNames(g.L3OwnerName, g.L3OwnerId),
                IsAutoEscalation = g.IsAutoEscalation
            }).ToList();

            var result = new GrievanceListResponseDTO
            {
                GrievanceList = processedGrievances
            };

            return new ApiResponseModel<GrievanceListResponseDTO>((int)HttpStatusCode.OK, SuccessMessage.Success, result);
        }

        public async Task<ApiResponseModel<GrievanceResponseDTO>> GetGrievanceTypeById(long grievanceTypeId)
        {
            var grievance = await _unitOfWork.GrievanceRepository.GetGrievanceTypeByIdAsync(grievanceTypeId);

            if (grievance == null)
            {
                return new ApiResponseModel<GrievanceResponseDTO>((int)HttpStatusCode.NotFound, ErrorMessage.GrievanceTypeNotFound, null);
            }

            // Process grievance to ensure unique OwnerIDs at each level
            var processedGrievance = new GrievanceResponseDTO
            {
                Id = grievance.Id,
                GrievanceName = grievance.GrievanceName,
                Description = grievance.Description,
                L1TatHours = grievance.L1TatHours,
                L1OwnerId = RemoveDuplicateIds(grievance.L1OwnerId),
                L1OwnerName = RemoveDuplicateNames(grievance.L1OwnerName, grievance.L1OwnerId),
                L2TatHours = grievance.L2TatHours,
                L2OwnerId = RemoveDuplicateIds(grievance.L2OwnerId),
                L2OwnerName = RemoveDuplicateNames(grievance.L2OwnerName, grievance.L2OwnerId),
                L3TatDays = grievance.L3TatDays,
                L3OwnerId = RemoveDuplicateIds(grievance.L3OwnerId),
                L3OwnerName = RemoveDuplicateNames(grievance.L3OwnerName, grievance.L3OwnerId),
                IsAutoEscalation = grievance.IsAutoEscalation
            };

            return new ApiResponseModel<GrievanceResponseDTO>((int)HttpStatusCode.OK, SuccessMessage.Success, processedGrievance);
        }

        public async Task<ApiResponseModel<CrudResult>> UpdateGrievance(GrievanceRequestDTO request)
        {
            try
            {

                if (request.Id <= 0)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidGrievanceId, CrudResult.Failed);
                }


                var grievanceType = new GrievanceType
                {
                    Id = request.Id,
                    GrievanceName = request.GrievanceName,
                    Description = request.Description ?? string.Empty,
                    L1TatHours = request.L1TatHours,
                    L2TatHours = request.L2TatHours,
                    L3TatDays = request.L3TatDays,
                    IsActive = true,
                    IsAutoEscalation = request.IsAutoEscalation,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = UserEmailId!
                };


                await _unitOfWork.GrievanceRepository.UpdateGrievanceTypeAsync(grievanceType);

                // Process owners for each level
                await AddGrievanceOwners(request.Id, 1, request.L1OwnerIds);
                await AddGrievanceOwners(request.Id, 2, request.L2OwnerIds);
                await AddGrievanceOwners(request.Id, 3, request.L3OwnerIds);


                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, $"{ErrorMessage.GrievanceCouldNotAdded}: {ex.Message}", CrudResult.Failed);
            }
        }


        private static string RemoveDuplicateIds(string ownerIds)
        {
            if (string.IsNullOrEmpty(ownerIds))
                return ownerIds;

            var ids = ownerIds.Split(',').Distinct().ToList();
            return string.Join(",", ids);
        }

        private static string RemoveDuplicateNames(string ownerNames, string ownerIds)
        {
            if (string.IsNullOrEmpty(ownerNames) || string.IsNullOrEmpty(ownerIds))
                return ownerNames;

            var names = ownerNames.Split(',').ToList();
            var ids = ownerIds.Split(',').ToList();
            var uniqueNames = new List<string>();
            var seenIds = new HashSet<string>();

            for (int i = 0; i < ids.Count; i++)
            {
                if (seenIds.Add(ids[i]))
                {
                    uniqueNames.Add(names[i]);
                }
            }
            return string.Join(",", uniqueNames);
        }


        public async Task<ApiResponseModel<EmployeeGrievanceResponseList>> GetEmployeeGrievancesAsync(long EmployeeId, SearchRequestDto<EmployeeGrievanceFilterDto> request)
        {
            var grievanceList = await _unitOfWork.GrievanceRepository.GetEmployeeGrievancesAsync(EmployeeId, request);

            if (grievanceList == null || grievanceList.EmployeeGrievanceList == null || !grievanceList.EmployeeGrievanceList.Any())
            {
                return new ApiResponseModel<EmployeeGrievanceResponseList>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }

            return new ApiResponseModel<EmployeeGrievanceResponseList>((int)HttpStatusCode.OK, SuccessMessage.Success, grievanceList);
        }



        public async Task<ApiResponseModel<SubmitEmployeeGrievanceDto>> SubmitGrievanceAsync(EmployeeGrievanceCreateDto request)
        {
            if (request == null)
            {
                return new ApiResponseModel<SubmitEmployeeGrievanceDto>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidRequest, null!);
            }

            var employeeGrievance = _mapper.Map<EmployeeGrievance>(request);
            string fileName = string.Empty;

            try
            {

                if (request.Attachment != null && !string.IsNullOrEmpty(request.Attachment.FileName))
                {
                    fileName = await _blobStorageClient.UploadFile(
                        request.Attachment,
                        request.EmployeeId,
                        BlobContainerConstants.UserDocumentContainer);

                    employeeGrievance.FileOriginalName = request.Attachment.FileName;
                }
                employeeGrievance.Level = 1;
                employeeGrievance.AttachmentPath = fileName;
                employeeGrievance.CreatedBy = UserEmailId!;
                employeeGrievance.CreatedOn = DateTime.UtcNow;

                var ticketNo = await _unitOfWork.GrievanceRepository.GenerateTicketNumberAsync(employeeGrievance.GrievanceTypeId);

                var result = await _unitOfWork.GrievanceRepository.InsertEmployeeGrievanceAsync(employeeGrievance, ticketNo);

                var submitEmployeeGrievanceDto = new SubmitEmployeeGrievanceDto()
                {
                    Id = result,
                    TicketNo = ticketNo
                };

                if (result > 0)
                {
                    //email Grievance Submitted ticketNo
                    await _email.GrievanceSubmittedEmailAsync(ticketNo);
                    return new ApiResponseModel<SubmitEmployeeGrievanceDto>((int)HttpStatusCode.Created, SuccessMessage.GrievanceSubmittedSuccessfully, submitEmployeeGrievanceDto);
                }
                else
                {
                    // Delete file if DB insert fails
                    if (!string.IsNullOrEmpty(fileName))
                    {
                        await _blobStorageClient.DeleteFile(fileName, BlobContainerConstants.UserDocumentContainer);
                    }

                    return new ApiResponseModel<SubmitEmployeeGrievanceDto>((int)HttpStatusCode.InternalServerError, ErrorMessage.FailedToSubmitGrievance, null!);
                }
            }
            catch (Exception ex)
            {
                // Clean up in case of unexpected exception
                if (!string.IsNullOrEmpty(fileName))
                {
                    await _blobStorageClient.DeleteFile(fileName, BlobContainerConstants.UserDocumentContainer);
                }


                return new ApiResponseModel<SubmitEmployeeGrievanceDto>((int)HttpStatusCode.InternalServerError, $"{ErrorMessage.ErrorToSubmitGrievance}{ex.Message}", null!);
            }
        }

        public async Task<ApiResponseModel<EmployeeGrievanceDetail>> GetEmployeeGrievancesDetailAsync(long TicketId)
        {
            var grievanceDetail = await _unitOfWork.GrievanceRepository.GetEmployeeGrievancesDetailAsync(TicketId);


            if (grievanceDetail == null)
            {
                return new ApiResponseModel<EmployeeGrievanceDetail>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }


            var request = _httpContextAccessor.HttpContext.Request;
            grievanceDetail.requesterAvatar = !string.IsNullOrWhiteSpace(grievanceDetail.requesterAvatar)
                ? $"{request.Scheme}://{request.Host}/Images/ProfileImage/{grievanceDetail.requesterAvatar}"
                : "";

            return new ApiResponseModel<EmployeeGrievanceDetail>((int)HttpStatusCode.OK, SuccessMessage.Success, grievanceDetail);
        }


        public async Task<ApiResponseModel<EmployeeListGrievanceResponseList>> GetAllEmployeeGrievancesAsync(SearchRequestDto<EmployeeListGrievanceFilterDto> request)
        {
            var grievanceList = await _unitOfWork.GrievanceRepository.GetEmployeeListGrievancesAsync(SessionUserId!, RoleId!, request);

            if (grievanceList == null)
            {
                return new ApiResponseModel<EmployeeListGrievanceResponseList>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }

            return new ApiResponseModel<EmployeeListGrievanceResponseList>((int)HttpStatusCode.OK, SuccessMessage.Success, grievanceList);
        }
        public async Task<ApiResponseModel<EmployeeGrievanceRemarksDetail>> GetEmployeeGrievanceRemarksDetailAsync(long ticketId)
        {

            var remarksDetail = await _unitOfWork.GrievanceRepository.GetEmployeeGrievanceRemarksDetailAsync(ticketId);

            if (remarksDetail == null || remarksDetail.RemarksList == null || !remarksDetail.RemarksList.Any())
            {
                return new ApiResponseModel<EmployeeGrievanceRemarksDetail>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }

            var request = _httpContextAccessor.HttpContext.Request;
            var baseUrl = $"{request.Scheme}://{request.Host}/Images/ProfileImage/";


            remarksDetail.RemarksList = remarksDetail.RemarksList
                .Select(remark =>
                {
                    remark.RemarkOwnerAvatar = !string.IsNullOrWhiteSpace(remark.RemarkOwnerAvatar) ? baseUrl + remark.RemarkOwnerAvatar : string.Empty;
                    return remark;
                })
                .ToList();

            return new ApiResponseModel<EmployeeGrievanceRemarksDetail>((int)HttpStatusCode.OK, SuccessMessage.Success, remarksDetail
            );
        }

        public async Task<ApiResponseModel<bool>> UpdateGrievanceAsync(UpdateGrievanceRemarksRequestDto request)
        {


            string? fileName = null;

            try
            {
                // Get owner id from session
                var ownerIdNullable = SessionUserId;
                if (!ownerIdNullable.HasValue || ownerIdNullable.Value == 0)
                {
                    return new ApiResponseModel<bool>((int)HttpStatusCode.Unauthorized, ErrorMessage.AuthenticationFailed, false);
                }

                int ownerId = ownerIdNullable.Value;

                // Get the grievance details by ticket ID
                var grievance = await _unitOfWork.GrievanceRepository.GetEmployeeGrievanceByIdAsync(request.TicketId);

                if (grievance == null)
                {
                    return new ApiResponseModel<bool>((int)HttpStatusCode.NotFound, ErrorMessage.GrievanceNotFound, false);
                }

                // Validate current owner has access at this level
                var owners = await _unitOfWork.GrievanceRepository.GetOwnersByGrievanceIdAndLevelAsync(grievance.GrievanceTypeId, grievance.Level);

                if (owners == null || !owners.Contains(ownerId))
                {
                    return new ApiResponseModel<bool>((int)HttpStatusCode.Forbidden, ErrorMessage.GrievanceAccessFailed, false);
                }

                // Upload file to blob if available
                if (request.Attachment != null && !string.IsNullOrEmpty(request.Attachment.FileName))
                {
                    fileName = await _blobStorageClient.UploadFile(
                        request.Attachment,
                        ownerId, // Owner ID used as folder or unique identifier
                        BlobContainerConstants.UserDocumentContainer);
                }

                // Insert remarks
                var remark = new GrievanceRemarks
                {
                    TicketId = request.TicketId,
                    Remarks = request.Remarks,
                    OwnerId = ownerId,
                    AttachmentPath = fileName,
                    FileOriginalName = request.Attachment?.FileName,
                    Status = request.Status,
                    CreatedOn = DateTime.UtcNow,
                    CreatedBy = UserEmailId!,
                    ModifiedBy = UserEmailId!,
                    ModifiedOn = DateTime.UtcNow,
                };

                await _unitOfWork.GrievanceRepository.InsertGrievanceRemarkAsync(remark);

                var ticketNo = await _unitOfWork.GrievanceRepository.GetTicketNoByIdAsync(request.TicketId);
                // Handle status updates
                if (request.Status == GrievanceStatus.Resolved)
                {
                    await _unitOfWork.GrievanceRepository.ResolveGrievanceAsync(request.TicketId, ownerId, remark);
                    await _email.GrievanceResolvedEmailAsync(ticketNo!);


                }
                else if (request.Status == GrievanceStatus.Escalated)
                {
                    if (grievance.Level >= 3)
                    {
                        return new ApiResponseModel<bool>((int)HttpStatusCode.BadRequest, ErrorMessage.GrievanceMaxLevel, false);
                    }

                    await _unitOfWork.GrievanceRepository.EscalateGrievanceAsync(request.TicketId, grievance.Level + 1, remark);
                }

                return new ApiResponseModel<bool>((int)HttpStatusCode.OK, SuccessMessage.GrievanceUpdated, true);
            }
            catch (Exception ex)
            {
                if (!string.IsNullOrEmpty(fileName))
                {
                    await _blobStorageClient.DeleteFile(fileName, BlobContainerConstants.UserDocumentContainer);
                }

                return new ApiResponseModel<bool>((int)HttpStatusCode.InternalServerError, $"{ErrorMessage.ErrorToSubmitGrievanceRemarks} {ex.Message}", false);
            }
        }

        public async Task<ApiResponseModel<bool>> UpdateRemarksAllowedAsync(int grievanceTypeId, int level)
        {
            var userId = SessionUserId!;

            var ownerList = await _unitOfWork.GrievanceRepository.GetOwnersByGrievanceIdAndLevelAsync(grievanceTypeId, level);

            if (ownerList == null || !ownerList.Contains((int)userId))
            {
                return new ApiResponseModel<bool>((int)HttpStatusCode.OK, ErrorMessage.GrievanceAccessFailed, false);
            }
            return new ApiResponseModel<bool>((int)HttpStatusCode.OK, SuccessMessage.GrievanceUpdateAllowed, true);
        }
        public async Task<byte[]> GetGrievanceReportInExcel(SearchRequestDto<EmployeeListGrievanceFilterDto> requestDto)
        {
            requestDto.StartIndex = 1;
            requestDto.PageSize = int.MaxValue;

            var response = await GetAllEmployeeGrievancesAsync(requestDto);
            if (response.StatusCode != StatusCodes.Status200OK || response.Result?.EmployeeListGrievance == null) throw new InvalidOperationException(ErrorMessage.FailedToGenerateGrievanceReport);


            using var package = new ExcelPackage();
            var worksheet = package.Workbook.Worksheets.Add("GrievanceReport");

            if (!response.Result.EmployeeListGrievance.Any()) return Array.Empty<byte>();

            var row = 1;
            var column = 1;
            worksheet.Cells.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
            worksheet.Cells.Style.WrapText = true;

            worksheet.Column(column).Width = 5; worksheet.Cells[row, column++].Value = "Sr No.";
            worksheet.Column(column).Width = 20; worksheet.Cells[row, column++].Value = "Ticket ID";
            worksheet.Column(column).Width = 25; worksheet.Cells[row, column++].Value = "Grievance Type";
            worksheet.Column(column).Width = 15; worksheet.Cells[row, column++].Value = "Status";
            worksheet.Column(column).Width = 15; worksheet.Cells[row, column++].Value = "Escalation Level";
            worksheet.Column(column).Width = 15; worksheet.Cells[row, column++].Value = "Created Date";
            worksheet.Column(column).Width = 20; worksheet.Cells[row, column++].Value = "Created By";
            worksheet.Column(column).Width = 20; worksheet.Cells[row, column++].Value = "Resolved By";
            worksheet.Column(column).Width = 15; worksheet.Cells[row, column++].Value = "Resolved Date";
            worksheet.Column(column).Width = 15; worksheet.Cells[row, column].Value = "TAT Status";


            foreach (var grievance in response.Result.EmployeeListGrievance)
            {
                row++;
                column = 1;
                worksheet.Cells[row, column++].Value = row - 1;
                worksheet.Cells[row, column++].Value = grievance.TicketNo;
                worksheet.Cells[row, column++].Value = grievance.GrievanceTypeName;
                worksheet.Cells[row, column++].Value = Enum.GetName(typeof(GrievanceStatus), grievance.Status);
                worksheet.Cells[row, column++].Value = "L" + grievance.Level;
                worksheet.Cells[row, column++].Value = grievance.CreatedOn.ToShortDateString();
                worksheet.Cells[row, column++].Value = grievance.CreatedBy;
                worksheet.Cells[row, column++].Value = grievance.ResolvedBy;
                worksheet.Cells[row, column++].Value = grievance.ResolvedDate?.ToShortDateString() ?? "Pending";
                worksheet.Cells[row, column].Value = Enum.GetName(typeof(TatStatus), grievance.TatStatus);
            }

            worksheet.Rows[1].Style.Font.Bold = true;
            return await package.GetAsByteArrayAsync();
        }


        public async Task<ApiResponseModel<GrievanceTypeListDto>> GetAllGrievancesTypeAsync()
        {
            var grievances = await _unitOfWork.GrievanceRepository.GetAllGrievancesAsync();
            var processedGrievances = grievances.GrievanceList.Select(g => new GrievanceTypeDto
            {
                Id = g.Id,
                GrievanceName = g.GrievanceName,
                Description = g.Description,

            }).ToList();

            var result = new GrievanceTypeListDto
            {
                GrievanceList = processedGrievances
            };

            return new ApiResponseModel<GrievanceTypeListDto>((int)HttpStatusCode.OK, SuccessMessage.Success, result);
        }

        public async Task<ApiResponseModel<bool>> GrievanceViewAllowedAsync(long grievanceId)
        {
            var userId = SessionUserId!;
            var roleId = RoleId!;

            if (roleId == Roles.SuperAdmin)
            {
                return new ApiResponseModel<bool>((int)HttpStatusCode.OK, SuccessMessage.GrievanceViewAllowed, true);
            }

            var IsAllowed = await _unitOfWork.GrievanceRepository.GrievanceViewAllowedAsync(grievanceId, userId);

            if (IsAllowed)
            {
                return new ApiResponseModel<bool>((int)HttpStatusCode.OK, SuccessMessage.GrievanceViewAllowed, true);
            }
            return new ApiResponseModel<bool>((int)HttpStatusCode.OK, ErrorMessage.GrievanceAccessFailed, false);
        }
    }
}