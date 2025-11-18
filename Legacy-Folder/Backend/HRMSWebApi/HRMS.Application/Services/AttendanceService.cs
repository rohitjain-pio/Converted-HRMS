using HRMS.Models.Models.Attendance;
using HRMS.Models;
using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using System.Net;
using AutoMapper;
using HRMS.Infrastructure;
using HRMS.Domain.Entities;
using Microsoft.AspNetCore.Http;
using HRMS.Models.Models.AttendanceConfiguration;
using HRMS.Models.Models.EmployeeReport;
using HRMS.Application.Clients;
using System.Globalization;

namespace HRMS.Application.Services
{
    public class AttendanceService : TokenService, IAttendanceService
    {

        private readonly IUnitOfWork _unitOfWork;
        private readonly TimeDoctorClient _timeDoctorClient;
        private readonly IMapper _mapper;
        private const string HoursMinutes = @"hh\:mm";
        private static readonly CultureInfo UsCulture = new("en-US");

        public AttendanceService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor, TimeDoctorClient timeDoctorClient) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _timeDoctorClient = timeDoctorClient;
        }

        public async Task<ApiResponseModel<CrudResult>> AddAttendanceAsync(long employeeId, AttendanceRequestDto attendanceRow)
        {
            TimeSpan totalHours;
            var IsMannualAttendance = await _unitOfWork.AttendanceRepository.GetConfigByEmployeeIDAsync(employeeId);
            if (!IsMannualAttendance)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.isManualAttendanceNotAllowed, CrudResult.Failed);
            }
            // Check if attendance already exists for this employee and date
            var attendanceId = await _unitOfWork.AttendanceRepository.AttendanceExistsAsync(employeeId, attendanceRow.Date);
            if (attendanceId != null)
            {
                return await UpdateAttendanceAsync(employeeId, attendanceRow, attendanceId.Value);

            }

            var audits = attendanceRow.Audit != null ? new List<AttendanceAuditDto>(attendanceRow.Audit) : new List<AttendanceAuditDto>();
            //calculating ToalHour
            totalHours = CalculateTotalHours(audits);
            var newAttendanceRow = ConvertToUtcTime(attendanceRow);
            var actionDate = DateTime.Parse(attendanceRow.Date,UsCulture);
            if (actionDate > DateTime.Today)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.AddingFutureDate, CrudResult.Failed);
            }


            var attendanceData = _mapper.Map<Attendance>(newAttendanceRow);

            attendanceData.Day = actionDate.ToString("dddd");
            attendanceData.AttendanceType = attendanceRow.AttendanceType ?? "Manual";
            attendanceData.CreatedBy = UserEmailId!;
            attendanceData.TotalHours = totalHours.ToString(HoursMinutes);
            attendanceData.CreatedOn = DateTime.UtcNow;
            if (String.IsNullOrEmpty(attendanceData.EndTime?.ToString()))
            {
                attendanceData.EndTime = null;
            }
            var result = await _unitOfWork.AttendanceRepository.AddAttendanceAsync(employeeId, attendanceData);
            if (result > 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success + " Addition", CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.RecordNotAdded, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<CrudResult>> AddAttendanceTimeDoctorStatAsync(long employeeId, Attendance attendanceRow)
        {
            var result = await _unitOfWork.AttendanceRepository.AddAttendanceAsync(employeeId, attendanceRow);
            if (result > 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.RecordNotAdded, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<CrudResult>> UpdateAttendanceAsync(long employeeId, AttendanceRequestDto attendanceRow, long? attendanceId)
        {
            if (attendanceId == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.RecordNotUpdated, CrudResult.Failed);
            }
            var isManualAttendanceAllowed = await _unitOfWork.AttendanceRepository.GetConfigByEmployeeIDAsync(employeeId);
            if (!isManualAttendanceAllowed)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.isManualAttendanceNotAllowed, CrudResult.Failed);
            }
            var attendanceEntity = _mapper.Map<Attendance>(attendanceRow);
            
            var attendanceDate = DateTime.Parse(attendanceRow.Date,UsCulture);
            if (attendanceDate > DateTime.Today)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.AddingFutureDate, CrudResult.Failed);
            }

            var existingAttendance = await _unitOfWork.AttendanceRepository.GetAttendanceByIdAsync(attendanceId.Value);
            var existingAttendanceDto = _mapper.Map<AttendanceRowDto>(existingAttendance);
            var localizedAttendance = ConvertUtcToDiffTimeZone(
                new List<AttendanceRowDto> { existingAttendanceDto },
                "India Standard Time");

            existingAttendance = _mapper.Map<Attendance>(localizedAttendance[0]);
            TimeSpan totalHours = TimeSpan.Zero;
            if (attendanceRow.Date == DateTime.Today.ToString("yyyy-MM-dd"))
            {
                if (string.IsNullOrEmpty(attendanceRow.EndTime))
                {
                    attendanceEntity.EndTime = null;
                }

                attendanceEntity.StartTime = existingAttendance?.StartTime;

                if (attendanceEntity.Audit != null && existingAttendance != null)
                {
                    var existingAudits = existingAttendance.Audit ?? new List<AttendanceAudit>();
                    var newAudits = attendanceEntity.Audit ?? new List<AttendanceAudit>();
                    existingAttendance.Audit = existingAudits.Concat(newAudits).ToList();
                }

                totalHours = CalculateTotalHours(_mapper.Map<List<AttendanceAuditDto>>(existingAttendance?.Audit ?? attendanceEntity.Audit));
            }
            else
            {
                if (attendanceEntity.StartTime.HasValue && attendanceEntity.EndTime.HasValue)
                {
                    totalHours = attendanceEntity.EndTime.Value - attendanceEntity.StartTime.Value;
                }
            }

            var utcAttendanceDto = ConvertToUtcTime(_mapper.Map<AttendanceRequestDto>(attendanceEntity));
            attendanceEntity = _mapper.Map<Attendance>(utcAttendanceDto);

            attendanceEntity.Day = attendanceDate.ToString("dddd");
            attendanceEntity.AttendanceType = "Manual";
            attendanceEntity.ModifiedBy = UserEmailId!;
            attendanceEntity.TotalHours = totalHours.ToString(HoursMinutes);
            attendanceEntity.ModifiedOn = DateTime.UtcNow;

            await _unitOfWork.AttendanceRepository.UpdateAttendanceAsync(employeeId, attendanceEntity, attendanceId.Value);

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success + " Update", CrudResult.Success);
        }


        public async Task<ApiResponseModel<AttendanceResponseDto>> GetAttendanceByEmployeeIdAsync(long employeeId, string? dateFrom, string? dateTo, int pageIndex, int pageSize)
        {
            var result = await _unitOfWork.AttendanceRepository.GetAttendanceByEmployeeIdAsync(employeeId, dateFrom, dateTo, pageIndex, pageSize);
            var IsMannualAttendance = await _unitOfWork.AttendanceRepository.GetConfigByEmployeeIDAsync(employeeId);
            result.IsManualAttendance = IsMannualAttendance;
            // gettiing if the employee has already timed in today
            var today = DateTime.Today.ToString("yyyy-MM-dd");
            var todayAttendance = await _unitOfWork.AttendanceRepository.GetAttendanceByEmployeeIdAsync(employeeId, today, today, 0, 1);
            if (todayAttendance != null && todayAttendance.AttendaceReport != null && todayAttendance.AttendaceReport.Count > 0 && todayAttendance.AttendaceReport[0]?.Audit?.Last().Action == "Time Out" || todayAttendance?.AttendaceReport?.Count == 0)
            {
                result.IsTimedIn = true;
            }
            else
            {
                result.IsTimedIn = false;
            }
            result.Dates = await _unitOfWork.AttendanceRepository.GetAttendanceDateList(employeeId);
            if (result.AttendaceReport != null && result.AttendaceReport.Count > 0)
            {
                result.AttendaceReport = ConvertUtcToDiffTimeZone(result.AttendaceReport, "India Standard Time");
                return new ApiResponseModel<AttendanceResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, result);
            }
            return new ApiResponseModel<AttendanceResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, result);
        }

        private static AttendanceRequestDto ConvertToUtcTime(AttendanceRequestDto attendanceRow)
        {
            var istZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            // Convert StartTime to UTC
            if (!string.IsNullOrEmpty(attendanceRow.StartTime)  && DateTime.TryParse(attendanceRow.Date + " " + attendanceRow.StartTime,UsCulture, out var localStartDateTime))
            {  
                var utcStart = TimeZoneInfo.ConvertTimeToUtc(localStartDateTime, istZone).TimeOfDay;
                attendanceRow.StartTime = utcStart.ToString(HoursMinutes);
                
            }
            // Convert EndTime to UTC
            if (!string.IsNullOrEmpty(attendanceRow.EndTime) && DateTime.TryParse(attendanceRow.Date + " " + attendanceRow.EndTime,UsCulture, out var localEndDateTime))
            {
                var utcEnd = TimeZoneInfo.ConvertTimeToUtc(localEndDateTime, istZone).TimeOfDay;
                attendanceRow.EndTime = utcEnd.ToString(HoursMinutes);
            }
            // Convert Audit times to UTC
            if (attendanceRow.Audit != null)
            {
                foreach (var audit in attendanceRow.Audit)
                {
                    if (!string.IsNullOrEmpty(audit.Time) && DateTime.TryParse(attendanceRow.Date + " " + audit.Time, UsCulture, out var localAuditDateTime))
                    {    
                        var utcAuditTime = TimeZoneInfo.ConvertTimeToUtc(localAuditDateTime, istZone).TimeOfDay;
                        audit.Time = utcAuditTime.ToString(HoursMinutes);
                    }
                }
            }
            return attendanceRow;
        }
        public async Task<ApiResponseModel<CrudResult>> UpdateConfigAsync(long employeeId)
        {
            if (employeeId <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidEmployeeId, CrudResult.Failed);
            }

            var empInfo = await _unitOfWork.EmploymentDetailRepository.GetEmplyementDetailByIdAsync(employeeId);
            if (empInfo == null) return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            string? timeDoctorUserId = empInfo.TimeDoctorUserId;
            if (empInfo.IsManualAttendance && string.IsNullOrEmpty(timeDoctorUserId))
            {
                timeDoctorUserId = await _timeDoctorClient.GetTimeDoctorUserIdByEmail(empInfo.Email);
                if (string.IsNullOrEmpty(timeDoctorUserId))
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.TimeDoctorUserIdNotFound, CrudResult.Failed);
                await _unitOfWork.AttendanceRepository.UpdateTimeDoctorUserId(empInfo.EmployeeId, timeDoctorUserId);
            }

            var request = new AttendanceConfigRequestDto
            {
                EmployeeId = employeeId,
                IsManualAttendance = !empInfo.IsManualAttendance,
            };

            var result = await _unitOfWork.AttendanceRepository.UpdateAttendanceConfigAsync(request);
            if (result > 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.InternalServerError, ErrorMessage.AttendanceUpdateFailed, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<AttendancConfigSearchResponseDto>> GetAttendanceConfigListAsync(SearchRequestDto<AttendanceConfigSearchRequestDto> requestDto)
        {
            var result = await _unitOfWork.AttendanceRepository.GetAttendanceConfigListAsync(SessionUserId, requestDto);
            if (result == null || result.AttendanceConfigList == null)
            {
                return new ApiResponseModel<AttendancConfigSearchResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
            return new ApiResponseModel<AttendancConfigSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, result);
        }
        public async Task<ApiResponseModel<EmployeeReportResponseDto>> GetEmployeeReport(SearchRequestDto<EmployeeReportSearchRequestDto> requestDto)
        {
            var startDate = requestDto.Filters?.DateFrom;
            var endDate = requestDto.Filters?.DateTo;

            if (startDate != null && endDate != null)
            {
                if (startDate > endDate)
                {
                    return new ApiResponseModel<EmployeeReportResponseDto>((int)HttpStatusCode.BadRequest, "Start date cannot be after end date.", null);
                }
                if ((endDate.Value - startDate.Value).TotalDays > 90)
                {
                    return new ApiResponseModel<EmployeeReportResponseDto>((int)HttpStatusCode.BadRequest, "Cannot enter more than 60 days", null);
                }
            }
            var data = await _unitOfWork.AttendanceRepository.GetEmployeeReport(SessionUserId,requestDto);

            if (data.EmployeeReports == null || data.EmployeeReports.Count == 0)
            {
                return new ApiResponseModel<EmployeeReportResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NoEmployeeFound, null);
            }
            return new ApiResponseModel<EmployeeReportResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, data);
        }

        public async Task<byte[]> GetAttendanceReportInExcel(SearchRequestDto<EmployeeReportSearchRequestDto> requestDto)
        {
            requestDto.StartIndex = 1;
            requestDto.PageSize = int.MaxValue;

            var response = await GetEmployeeReport(requestDto);
            if (response.StatusCode != StatusCodes.Status200OK) throw new InvalidOperationException(ErrorMessage.FailedToGenerateAttendanceReport);
            if (response.Result?.EmployeeReports == null) throw new InvalidOperationException(ErrorMessage.FailedToGenerateAttendanceReport);

            var startDate = requestDto.Filters.DateFrom ?? DateTime.Today.AddDays(-90);
            var endDate = requestDto.Filters.DateTo ?? DateTime.Today;
            var excelBytes = await _unitOfWork.AttendanceRepository.GenerateAttendanceReportExcelFile(response.Result.EmployeeReports, startDate, endDate);
            return excelBytes;
        }

        public async Task<ApiResponseModel<List<EmployeeCodeServiceDto>>> GetEmployeeCodeAndNameListAsync(string? employeeCode, string? employeeName, bool exEmployee)
        {
            var result = await _unitOfWork.AttendanceRepository.GetEmployeeCodeAndNameListAsync(RoleId!, SessionUserId!,employeeCode,employeeName,exEmployee);

            return new ApiResponseModel<List<EmployeeCodeServiceDto>>(200, "Success", result);
        }

        private static TimeSpan CalculateTotalHours(List<AttendanceAuditDto> audits)
        {
            TimeSpan total = TimeSpan.Zero;

            var ins = audits.FindAll(item => item.Action == "Time In");
            var outs = audits.FindAll(a => a.Action == "Time Out");
            for (int i = 0; i < Math.Min(ins.Count, outs.Count); i++)
            {
                var inTime = TimeSpan.Parse(ins[i].Time,UsCulture);
                var outTime = TimeSpan.Parse(outs[i].Time,UsCulture);
                total += outTime - inTime;
            }


            return total;
        }
        private static List<AttendanceRowDto> ConvertUtcToDiffTimeZone(List<AttendanceRowDto> attendanceRow, string timeZoneId)
        {
            TimeZoneInfo istZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            foreach (var attendance in attendanceRow)
            {
                if (!string.IsNullOrEmpty(attendance.StartTime))
                {
                    DateTime utcStart;
                    if (!DateTime.TryParse($"2000-01-01T{attendance.StartTime}", UsCulture, out utcStart))
                    {
                        DateTime.TryParse($"2000-01-01T{attendance.StartTime}:00",UsCulture ,out utcStart);
                    }
                    if (utcStart != default)
                    {
                        utcStart = DateTime.SpecifyKind(utcStart, DateTimeKind.Utc);
                        var istStart = TimeZoneInfo.ConvertTimeFromUtc(utcStart, istZone);
                        attendance.StartTime = istStart.ToString(utcStart.Second > 0 ? "HH:mm:ss" : "HH:mm");
                    }
                }
                if (!string.IsNullOrEmpty(attendance.EndTime))
                {
                    DateTime utcEnd;
                    if (!DateTime.TryParse($"2000-01-01T{attendance.EndTime}",UsCulture, out utcEnd))
                    {
                        DateTime.TryParse($"2000-01-01T{attendance.EndTime}:00",UsCulture, out utcEnd);
                    }
                    if (utcEnd != default)
                    {
                        utcEnd = DateTime.SpecifyKind(utcEnd, DateTimeKind.Utc);
                        var istEnd = TimeZoneInfo.ConvertTimeFromUtc(utcEnd, istZone);
                        attendance.EndTime = istEnd.ToString(utcEnd.Second > 0 ? "HH:mm:ss" : "HH:mm");
                    }
                }
                if (attendance.Audit != null)
                {
                    foreach (var audit in attendance.Audit)
                    {
                        if (!string.IsNullOrEmpty(audit.Time) && TimeSpan.TryParse(audit.Time,UsCulture, out var utcTimeSpan))
                        {
                                var utcDateTime = new DateTime(2000, 1, 1, 0, 0, 0, DateTimeKind.Utc).Add(utcTimeSpan);
                                utcDateTime = DateTime.SpecifyKind(utcDateTime, DateTimeKind.Utc);
                                var istAudit = TimeZoneInfo.ConvertTimeFromUtc(utcDateTime, istZone);
                                audit.Time = istAudit.ToString("HH:mm");
                        }
                    }
                }
            }
            return attendanceRow;
        }


    }

}

