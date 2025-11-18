using AutoMapper;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using HRMS.Models;
using Microsoft.AspNetCore.Http;
using System.Net;
using HRMS.Models.Models.Leave;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Utility;
using OfficeOpenXml;
using System.Text.Json;
using HRMS.Domain;
using Microsoft.Extensions.Options;
using System.Globalization;
using HRMS.Application.Clients;
using HRMS.Models.Models.Downtown;
using HRMS.Domain.Configurations;

namespace HRMS.Application.Services
{
    public class LeaveManagementService : TokenService, ILeaveManangementService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly AppConfigOptions _appConfig;
        private readonly LeavesAccrualOptions _leavesAccrualOptions;
        private readonly DownTownClient _downTownClient;
        private const string USDateFormat = "MM/dd/yyyy";
        private readonly IEmailNotificationService _emailNotification;
        public LeaveManagementService(IUnitOfWork unitOfWork, DownTownClient downTownClient, IMapper mapper, IOptions<LeavesAccrualOptions> leavesAccrualOptions, IHttpContextAccessor httpContextAccessor, IEmailNotificationService emailNotification, IOptions<AppConfigOptions> appConfig) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _appConfig = appConfig.Value;
            _leavesAccrualOptions = leavesAccrualOptions.Value;
            _downTownClient = downTownClient;
            _emailNotification = emailNotification;
        }
        public async Task<ApiResponseModel<IEnumerable<LeaveTypeResponseDto>>> GetEmployeeLeavesList()

        {
            var leaves = await _unitOfWork.LeaveManagementRepository.GetEmployeeLevesAsync();
            if (leaves != null && leaves.Any())
            {
                return new ApiResponseModel<IEnumerable<LeaveTypeResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, leaves);
            }
            else
            {
                return new ApiResponseModel<IEnumerable<LeaveTypeResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }
        public async Task<ApiResponseModel<IEnumerable<EmployeeLeaveResponseDto>>> GetEmployeeLeavesById(int id)

        {
            var leaves = await _unitOfWork.LeaveManagementRepository.GetEmployeeLevesByIdAsync(id);
            if (leaves != null && leaves.Any())
            {
                return new ApiResponseModel<IEnumerable<EmployeeLeaveResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, leaves);
            }
            var gender = await _unitOfWork.UserProfileRepository.GetUserGender(id);
            var request = await _unitOfWork.UserProfileRepository.GetUserJoiningDate(id);

            if (request == null)
            {
                return new ApiResponseModel<IEnumerable<EmployeeLeaveResponseDto>>(
                    (int)HttpStatusCode.BadRequest,
                    ErrorMessage.JoiningDateOrGender,
                    null
                );
            }
            var leaveBalance = LeaveBalanceHelper.GetOpeningBalance(request.Value, _leavesAccrualOptions, gender);
            await _unitOfWork.EmploymentDetailRepository.AddIfNotExistsEmployeeOpeningLeaveBalance(id, leaveBalance);
            leaves = await _unitOfWork.LeaveManagementRepository.GetEmployeeLevesByIdAsync(id);
            return new ApiResponseModel<IEnumerable<EmployeeLeaveResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, leaves);

        }
        public async Task<ApiResponseModel<CrudResult>> UpdateLeaveBalance(EmployeeLeaveRequestDto request)
        {
            var leaveBalanceDto = await _unitOfWork.LeaveManagementRepository.GetEmployeeLevesByIdAsync(request.EmployeeId);

            if (leaveBalanceDto == null || !leaveBalanceDto.Any())
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }

            var employeeLeaveDto = _mapper.Map<EmployeeLeave>(request);
            employeeLeaveDto.ModifiedBy = UserEmailId;
            employeeLeaveDto.EmployeeId = request.EmployeeId;
            employeeLeaveDto.LeaveId = request.LeaveId;

            var mlLeave = leaveBalanceDto.FirstOrDefault(x => x.LeaveId == (int)LeaveEnum.ML && x.IsActive);
            if (request.LeaveId == (int)LeaveEnum.PL && request.IsActive && mlLeave != null)
            {
                var updateDTO = new EmployeeLeave()
                {
                    ModifiedBy = UserEmailId,
                    EmployeeId = request.EmployeeId,
                    LeaveId = (int)LeaveEnum.ML,
                    IsActive = false,
                    OpeningBalance = mlLeave.OpeningBalance
                };
                await _unitOfWork.LeaveManagementRepository.UpdateLeaveBalanceAsync(updateDTO);
            }

            var plLeave = leaveBalanceDto.FirstOrDefault(x => x.LeaveId == (int)LeaveEnum.PL && x.IsActive);
            if (request.LeaveId == (int)LeaveEnum.ML && request.IsActive && plLeave != null)
            {
                var updateDTO = new EmployeeLeave()
                {
                    ModifiedBy = UserEmailId,
                    EmployeeId = request.EmployeeId,
                    LeaveId = (int)LeaveEnum.PL,
                    IsActive = false,
                    OpeningBalance = plLeave.OpeningBalance
                };
                await _unitOfWork.LeaveManagementRepository.UpdateLeaveBalanceAsync(updateDTO);
            }

            await _unitOfWork.LeaveManagementRepository.UpdateLeaveBalanceAsync(employeeLeaveDto);

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
        }

        public async Task<ApiResponseModel<LeaveCalendarResonseDto>> GetMonthlyLeaveCalendarAsync(LeaveCalendarSearchRequestDto request)
        {
            var leaveCalendar = await _unitOfWork.LeaveManagementRepository.GetMonthlyLeaveCalendarAsync(RoleId!, request);
            if (leaveCalendar == null)
            {
                return new ApiResponseModel<LeaveCalendarResonseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, null);
            }
            return new ApiResponseModel<LeaveCalendarResonseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, leaveCalendar);
        }


        public async Task<ApiResponseModel<CrudResult>> ApplyLeaveAsync(EmployeeLeaveApplyRequestDto request)
        {

            if (request.EmployeeId <= 0 || request.LeaveId <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidLeaveApplication, CrudResult.Failed);
            }


            var leaveBalance = await _unitOfWork.LeaveManagementRepository.GetEmployeeLeaveBalanceAsync(request.EmployeeId, request.LeaveId);

            if (leaveBalance == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.LeaveBalanceZero, CrudResult.Failed);
            }

            var leaveDays = request.TotalLeaveDays;
            
            if (leaveBalance.ClosingBalance < leaveDays)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InsufficientLeaveBalance, CrudResult.Failed);
            }


            var result = await _unitOfWork.LeaveManagementRepository.ApplyLeaveAsync(
                request,
                updatedBalance: leaveBalance.ClosingBalance - leaveDays,
                createdBy: UserEmailId!
            );

            if (result == 1)
            {
                await _emailNotification.LeaveAppliedEmailAsync(request.EmployeeId, request.LeaveId);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.LeaveAppliedSuccessfully, CrudResult.Success);
            }
            else if (result == -1)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.DuplicateLeaveApplication, CrudResult.Failed);
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.LeaveApplicatiionFailed, CrudResult.Failed);
            }

        }



        public async Task<ApiResponseModel<AccrualsUtilizedListResponseDto>> GetAccrualsUtilizedById(int id, SearchRequestDto<AccrualLeaveSearchRequestDto> requestDto)
        {
            var leaves = await _unitOfWork.LeaveManagementRepository.GetAccrualsUtilizedByIdAsync(id, requestDto);
            if (leaves != null)
            {
                return new ApiResponseModel<AccrualsUtilizedListResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, leaves);
            }
            else
            {
                return new ApiResponseModel<AccrualsUtilizedListResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }


        public async Task<ApiResponseModel<GetAppliedLeavesTotalRecordsDto>> GetFilteredAppliedLeavesList(SearchRequestDto<AppliedLeaveSearchRequestDto> request)
        {
            var result = await _unitOfWork.LeaveManagementRepository.GetFilteredAppliedLeavesAsync(request);

            if (result != null)
            {
                return new ApiResponseModel<GetAppliedLeavesTotalRecordsDto>(
                 (int)HttpStatusCode.OK,
                 SuccessMessage.Success,
                 result
                );
            }

            return new ApiResponseModel<GetAppliedLeavesTotalRecordsDto>(
             (int)HttpStatusCode.OK,
             ErrorMessage.NotFoundMessage,
             null
            );
        }


        public async Task<ApiResponseModel<EmpLeaveBalanceListResponseDto>> GetLeaveBalanceById(int id)
        {
            var gender = await _unitOfWork.UserProfileRepository.GetUserGender(id);
            var request = await _unitOfWork.UserProfileRepository.GetUserJoiningDate(id);

            if (request == null)
            {
                return new ApiResponseModel<EmpLeaveBalanceListResponseDto>(
                    (int)HttpStatusCode.BadRequest,
                    ErrorMessage.JoiningDateOrGender,
                    null
                );
            }
            var leaveBalance = LeaveBalanceHelper.GetOpeningBalance(request.Value, _leavesAccrualOptions, gender);
            await _unitOfWork.EmploymentDetailRepository.AddIfNotExistsEmployeeOpeningLeaveBalance(id, leaveBalance);
            var leaves = await _unitOfWork.LeaveManagementRepository.GetLeaveBalanceByIdAsync(id);
            if (leaves != null)
            {
                return new ApiResponseModel<EmpLeaveBalanceListResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, leaves);
            }
            else
            {
                return new ApiResponseModel<EmpLeaveBalanceListResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<EmployeeLeaveDetailResponseDto>> GetEmpLeaveDetailById(int id)

        {
            var leaveDetail = await _unitOfWork.LeaveManagementRepository.GetEmpLeaveDetailByIdAsync(id);
            if (leaveDetail != null)
            {
                return new ApiResponseModel<EmployeeLeaveDetailResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, leaveDetail);
            }
            else
            {
                return new ApiResponseModel<EmployeeLeaveDetailResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }


        public async Task<ApiResponseModel<LeaveHistoryTotalRecordsResponseDto>> GetLeaveHistoryByEmployeeIdAsync(long employeeId, SearchRequestDto<LeaveHistoryFilterDto> request)
        {
            var result = await _unitOfWork.LeaveManagementRepository.GetLeaveHistoryByEmployeeIdAsync(employeeId, request);

            if (result != null)
            {
                return new ApiResponseModel<LeaveHistoryTotalRecordsResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, result);
            }

            return new ApiResponseModel<LeaveHistoryTotalRecordsResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
        }


        public async Task<ApiResponseModel<GetAllLeaveBalanceResponseDto>> GetLeaveBalanceByEmployeeAndLeaveId(GetAllLeaveBalanceRequestDto requestDto)
        {
            long employeeId = requestDto.EmployeeId;
            int leaveId = requestDto.LeaveId;
            var result = await _unitOfWork.LeaveManagementRepository.GetLeaveBalanceAsync(employeeId, leaveId);

            if (result != null)
            {
                return new ApiResponseModel<GetAllLeaveBalanceResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, result);
            }

            return new ApiResponseModel<GetAllLeaveBalanceResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);

        }


        public async Task<ApiResponseModel<bool?>> IsReportingManagerExist(int id)
        {

            bool? response = await _unitOfWork.LeaveManagementRepository.IsReportingManagerExistAsync(id);

            if (response != null)
            {
                return new ApiResponseModel<bool?>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<bool?>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> ApproveOrRejectLeaveAsync(LeaveApprovalDto request)
        {
            var result = await _unitOfWork.LeaveManagementRepository.ApproveOrRejectLeaveAndInsertAccrualAsync(request, UserEmailId!);

            if (result)
            {
                if (request.Decision == LeaveStatus.Accepted)
                {
                    await _emailNotification.LeaveApprovalEmailAsync(request.AppliedLeaveId);
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.LeaveApproved, CrudResult.Success);
                    
                }
                else if(request.Decision == LeaveStatus.Rejected)
                  await _emailNotification.LeaveRejectionEmailAsync(request.AppliedLeaveId);
                  return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.LeaveRejected, CrudResult.Success);
            }

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.LeaveNotFound, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<CrudResult>> ImportEmployeeLeaveExcel(IFormFile leaveExcelFile, bool importConfirmed)
        {
            if (leaveExcelFile == null || leaveExcelFile.Length == 0)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, "File not found", CrudResult.Failed);

            if (leaveExcelFile.Length > _appConfig.ExcelImportMaxSize)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidExcelFileMaxSize, CrudResult.Failed);

            var extension = Path.GetExtension(leaveExcelFile.FileName).ToLower();
            if (!FileValidations.AllowedExtensions.Contains(extension))
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, "Invalid file format", CrudResult.Failed);

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
            var leaveEntries = new List<EmployeeLeave>();
            var invalidRecords = new List<(int Row, string Reason)>();
            var duplicateRecords = new List<(string EmpCode, string Reason)>();
            var empCodeSet = new HashSet<string>(); // For duplicates

            try
            {
                using var stream = new MemoryStream();
                await leaveExcelFile.CopyToAsync(stream);

                using var package = new ExcelPackage(stream);
                var worksheet = package.Workbook.Worksheets.First();
                var rowCount = worksheet.Dimension.Rows;

                var headerRow = worksheet.Cells[1, 1, 1, worksheet.Dimension.Columns].ToList();
                var headerMap = headerRow.ToDictionary(cell => cell.Text.Trim().ToLowerInvariant().Replace("\u00A0", " "), cell => cell.Start.Column);

                var requiredHeaders = new List<string>
                {
                    "sl no", "empcode", "empname", "casual / sick leave", "earned leave", "bereavement leave",
                    "paternity leave", "maternity leave", "advance leave", "leave bucket"
                };

                string unavailableHeaders = ValidateHeaders(headerMap, requiredHeaders);
                if (!string.IsNullOrEmpty(unavailableHeaders))
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, unavailableHeaders, CrudResult.Failed);

                var empCodeToIdMap = await _unitOfWork.LeaveManagementRepository.GetEmployeeCodeIdMapping();

                for (int row = 2; row <= rowCount; row++)
                {
                    var empCode = worksheet.Cells[row, headerMap["empcode"]].Text.Trim();
                    var hasPLleave = int.TryParse(worksheet.Cells[row, headerMap["paternity leave"]].Text.Trim(), out var plLeaves);
                    var hasMLleave = int.TryParse(worksheet.Cells[row, headerMap["maternity leave"]].Text.Trim(), out var mlLeaves);

                    if (string.IsNullOrEmpty(empCode))
                    {
                        invalidRecords.Add((row, "Missing EmpCode"));
                        continue;
                    }

                    if (empCodeSet.Contains(empCode))
                    {
                        duplicateRecords.Add((empCode, $"Duplicate EmpCode '{empCode}' at row {row}"));
                        continue;
                    }

                    empCodeSet.Add(empCode);

                    if (!empCodeToIdMap.ContainsKey(empCode))
                    {
                        invalidRecords.Add((row, $"EmpCode '{empCode}' not found"));
                        continue;
                    }

                    if (hasPLleave && hasMLleave && mlLeaves > 0 && plLeaves > 0)
                    {
                        invalidRecords.Add((row, $"EmpCode '{empCode}' has both Maternity & Paternity leaves"));
                        continue;
                    }

                    var employeeId = empCodeToIdMap[empCode];

                    try
                    {
                        var leaveEntry = new EmployeeLeave
                        {
                            EmployeeId = employeeId,
                            CreatedBy = UserEmailId!,
                            CreatedOn = DateTime.UtcNow,
                            LeaveDate = DateOnly.FromDateTime(DateTime.UtcNow),
                            IsActive = false,
                            Leaves = new Dictionary<string, decimal>
                         {
                            { "CasualSickLeave", ParseDecimal(worksheet.Cells[row, headerMap["casual / sick leave"]].Text) },
                            { "EarnedLeave", ParseDecimal(worksheet.Cells[row, headerMap["earned leave"]].Text) },
                            { "BereavementLeave", ParseDecimal(worksheet.Cells[row, headerMap["bereavement leave"]].Text) },
                            { "PaternityLeave", ParseDecimal(worksheet.Cells[row, headerMap["paternity leave"]].Text) },
                            { "MaternityLeave", ParseDecimal(worksheet.Cells[row, headerMap["maternity leave"]].Text) },
                            { "AdvanceLeave", ParseDecimal(worksheet.Cells[row, headerMap["advance leave"]].Text) },
                            { "LeaveBucket", ParseDecimal(worksheet.Cells[row, headerMap["leave bucket"]].Text) },
                         }
                        };

                        leaveEntries.Add(leaveEntry);
                    }
                    catch (Exception)
                    {
                        invalidRecords.Add((row, $"Invalid leave data at row {row}"));
                        continue;
                    }
                }

                if (!importConfirmed)
                {
                    var response = new
                    {
                        validRecordsCount = leaveEntries.Count,
                        duplicateCount = duplicateRecords.Count,
                        duplicateRecords = duplicateRecords.Select(x => new { empCode = x.EmpCode, reason = x.Reason }),
                        invalidCount = invalidRecords.Count,
                        invalidRecords = invalidRecords.Select(x => new { row = x.Row, reason = x.Reason })
                    };
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, JsonSerializer.Serialize(response), CrudResult.Success);
                }

                if (leaveEntries.Any())
                {
                    var inserted = await _unitOfWork.LeaveManagementRepository.InsertEmployeeLeavesAsync(leaveEntries);
                    if (inserted > 0)
                        return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, $"{inserted} records successfully imported.", CrudResult.Success);
                }

                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, "No valid records to import.", CrudResult.Failed);
            }
            catch (Exception ex)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ex.Message, CrudResult.Failed);
            }
        }

        private static decimal ParseDecimal(string input)
        {
            return decimal.TryParse(input, out var result) ? result : 0;
        }

        private static string ValidateHeaders(Dictionary<string, int> headerMap, List<string> requiredHeaders)
        {
            var normalizedHeaderMap = headerMap
                .ToDictionary(
                    kvp => kvp.Key.ToLowerInvariant().Replace(".", "").Trim(),
                    kvp => kvp.Value);

            var missing = requiredHeaders
                .Where(h => !normalizedHeaderMap.ContainsKey(h.Replace(".", "").ToLowerInvariant().Trim()))
                .ToList();

            return missing.Any() ? $"Missing required headers: {string.Join(", ", missing)}" : string.Empty;
        }


        public async Task<ApiResponseModel<LeaveRequestListResponseDto>> GetEmployeeLeaveRequestById(SearchRequestDto<GetLeaveRequestSearchRequestDto> requestDto)
        {
            var leaves = await _unitOfWork.LeaveManagementRepository.GetEmployeeLeaveRequestAsync(RoleId!, SessionUserId!, requestDto);
            if (leaves != null)
            {
                return new ApiResponseModel<LeaveRequestListResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, leaves);
            }
            else
            {
                return new ApiResponseModel<LeaveRequestListResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }



        public async Task<ApiResponseModel<CrudResult>> ApplySwapHolidayAsync(SwapHolidayApplyRequestDto request)
        {

            var acceptedSwaps = await _unitOfWork.LeaveManagementRepository.GetAcceptedSwapsCountAsync(request.EmployeeId, DateTime.UtcNow.Year);
            if (acceptedSwaps >= 2)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.SwapLimitExceeded, CrudResult.Failed);
            }


            var swapHoliday = _mapper.Map<CompOffAndSwapHolidayDetail>(request);
            swapHoliday.Status = LeaveStatus.Pending;
            swapHoliday.Type = RequestType.swap;
            swapHoliday.CreatedOn = DateTime.UtcNow;
            swapHoliday.CreatedBy = UserEmailId!;

            var result = await _unitOfWork.LeaveManagementRepository.ApplySwapHolidayAsync(swapHoliday);

            if (result == 1)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.SwapAppliedSuccessfully, CrudResult.Success);
            }
            else if (result == -1)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.DuplicateSwapApplication, CrudResult.Failed);
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.SwapApplicationFailed, CrudResult.Failed);
            }
        }

        public async Task<ApiResponseModel<CompOffAndSwapHolidayListResponseDto>> GetCompOffAndSwapHolidayDetailsById(SearchRequestDto<CompOffAndSwapHolidaySearchRequestDto> requestDto)
        {
            var leaveList = await _unitOfWork.LeaveManagementRepository.GetCompOffAndSwapHolidayDetailsAsync(RoleId!, SessionUserId!, requestDto);
            if (leaveList != null && leaveList.CompOffAndSwapHolidayList.Any())
            {
                return new ApiResponseModel<CompOffAndSwapHolidayListResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, leaveList);
            }
            else
            {
                return new ApiResponseModel<CompOffAndSwapHolidayListResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, leaveList);
            }
        }
        
        public async Task<ApiResponseModel<CrudResult>> ApplyCompOffAsync(CompOffRequestDto request)
        {
             
            var swapHoliday = _mapper.Map<CompOffAndSwapHolidayDetail>(request);
            swapHoliday.Status = LeaveStatus.Pending;
            swapHoliday.Type = RequestType.CompOff;
            swapHoliday.CreatedOn = DateTime.UtcNow;
            swapHoliday.CreatedBy = UserEmailId!;

            var result = await _unitOfWork.LeaveManagementRepository.ApplyCompOffAsync(swapHoliday);

            if (result == 1)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.CompOffAppliedSuccessfully, CrudResult.Success);
            }
            if (result == -1)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.CompOffAlreadyExist, CrudResult.Success);
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.CompOffApplicationFailed, CrudResult.Failed);
            }
        }
        public async Task<ApiResponseModel<CrudResult>> ApproveOrRejectCompOffSwapHoliday(CompOffAndSwapHolidayDetailRequestDto request)
        {

            var CompOffAndSwapHoliday = _mapper.Map<CompOffAndSwapHolidayDetail>(request);
            CompOffAndSwapHoliday.ModifiedBy = UserEmailId!;
            CompOffAndSwapHoliday.ModifiedOn = DateTime.UtcNow;
    
            if (CompOffAndSwapHoliday != null && CompOffAndSwapHoliday.Type == RequestType.CompOff)
            {
                await _unitOfWork.LeaveManagementRepository.ApproveOrRejectCompOffAsync(CompOffAndSwapHoliday);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            else if (CompOffAndSwapHoliday != null && CompOffAndSwapHoliday.Type == RequestType.swap)
            {
                await _unitOfWork.LeaveManagementRepository.ApproveOrRejectSwapAsync(CompOffAndSwapHoliday);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                
            }
            
            // Need to return apropriate results 
             

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.LeaveNotFound, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<IEnumerable<CompOffAndSwapResponseDto>>> GetAllAdjustedLeaveByEmployeeAsync(long employeeId)
        {
            var leaveList = await _unitOfWork.LeaveManagementRepository.GetAllAdjustedLeaveByEmployeeAsync(employeeId);
            if (leaveList!= null  && leaveList.Any())
            {
                return new ApiResponseModel<IEnumerable<CompOffAndSwapResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, leaveList);
            }
            else
            {
                return new ApiResponseModel<IEnumerable<CompOffAndSwapResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<Holidays>> GetPersonalizedHolidayListAsync(long employeeId)
        {
            
            var holidayResponse = await _downTownClient.GetHolidayListAsync();
            if (holidayResponse?.data == null)
            {
                return new ApiResponseModel<Holidays>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage ?? "No holidays found", null);
            }

            var personalizedHolidays = holidayResponse.data.holidays;

            
            var acceptedSwaps = await _unitOfWork.LeaveManagementRepository.GetAcceptedSwapHolidaysAsync(employeeId);
            
            if (acceptedSwaps != null && acceptedSwaps.Any())
            {
                var indiaSwaps = new List<SwapHolidayDto>();
                foreach (var holiday in personalizedHolidays.India.ToList())
                {
                    var parsedHolidayDate = DateTime.ParseExact(holiday.date, USDateFormat, CultureInfo.InvariantCulture).Date;
                    var matchingSwap = acceptedSwaps.FirstOrDefault(s => s.WorkingDate.Date == parsedHolidayDate);
                    if (matchingSwap != null)
                    {
                        personalizedHolidays.India.Remove(holiday);
                        
                        var newHoliday = new Holiday
                        {
                            date = matchingSwap.LeaveDate.ToString(USDateFormat),
                            day = matchingSwap.LeaveDate.ToString("dddd"),
                            location = holiday.location,
                            remarks = string.IsNullOrEmpty(matchingSwap.LeaveDateLabel) ? "Swapped Holiday" : matchingSwap.LeaveDateLabel
                        };

                        personalizedHolidays.India.Add(newHoliday); 

                        
                        indiaSwaps.Add(matchingSwap); 
                    }
                }

                foreach (var holiday in personalizedHolidays.USA.ToList())
                {
                    var parsedHolidayDate = DateTime.ParseExact(holiday.date, USDateFormat, CultureInfo.InvariantCulture).Date;
                    var matchingSwap = acceptedSwaps.FirstOrDefault(s => !indiaSwaps.Contains(s) && s.WorkingDate.Date == parsedHolidayDate);
                    if (matchingSwap != null)
                    {
                        personalizedHolidays.USA.Remove(holiday);   
                        var newHoliday = new Holiday
                        {
                            date = matchingSwap.LeaveDate.ToString(USDateFormat),
                            day = matchingSwap.LeaveDate.ToString("dddd"),
                            location = holiday.location,
                            remarks = string.IsNullOrEmpty(matchingSwap.LeaveDateLabel) ? "Swapped Holiday" : matchingSwap.LeaveDateLabel
                        };
                        personalizedHolidays.USA.Add(newHoliday); 
                    }
                }

                personalizedHolidays.India = personalizedHolidays.India
                    .OrderBy(h => DateTime.ParseExact(h.date, USDateFormat, CultureInfo.InvariantCulture))
                    .ToList();
                personalizedHolidays.USA = personalizedHolidays.USA
                    .OrderBy(h => DateTime.ParseExact(h.date, USDateFormat, CultureInfo.InvariantCulture))
                    .ToList();
            }

            return new ApiResponseModel<Holidays>((int)HttpStatusCode.OK, SuccessMessage.Success, personalizedHolidays);
        }

    }
}