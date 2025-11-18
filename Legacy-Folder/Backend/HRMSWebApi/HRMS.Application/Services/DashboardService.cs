using AutoMapper;
using HRMS.Application.Clients;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Configurations;
using HRMS.Domain.Contants;
using HRMS.Infrastructure.Interface;
using HRMS.Models;
using HRMS.Models.Models.Dashboard;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Options;
using System.Net;
using Microsoft.AspNetCore.Http;

namespace HRMS.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRespository _dashboardRespository;
        private readonly IMapper _mapper;
        private readonly IHostingEnvironment _environment;
        private readonly DownTownClient _downTownClient;
        private readonly FilePathOptions _filePathOption;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public DashboardService(IDashboardRespository dashboardRespository, IMapper mapper, IOptions<FilePathOptions> filePathOption, IHostingEnvironment environment, DownTownClient downTownClient, IHttpContextAccessor httpContextAccessor)
        {
            _dashboardRespository = dashboardRespository;
            _mapper = mapper;
            _environment = environment;
            _downTownClient = downTownClient;
            _filePathOption = filePathOption.Value;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<ApiResponseModel<IEnumerable<BirthdayResponseDto>>> GetEmployeesBirthdayList()
        {
            var response = await _dashboardRespository.GetEmployeesBirthdayList();
            if (response != null && response.Any())
            {
                var path = Path.Combine(_environment.WebRootPath, _filePathOption.ProfileDirectoryLocation);
                response = response
                .Select(item =>
                {
                    if (item != null && !string.IsNullOrEmpty(item.FileName))
                        item.FileName = path + item.FileName;
                    return item;
                });
                var birthdayDto = _mapper.Map<List<BirthdayResponseDto>>(response);
                return new ApiResponseModel<IEnumerable<BirthdayResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, birthdayDto);
            }
            else
            {
                return new ApiResponseModel<IEnumerable<BirthdayResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NoBirthdayExists, null);
            }
        }

        public async Task<ApiResponseModel<EmployeesCountResponseDto>> GetEmployeesCount(DashboardRequestDto request)
        {
            var employeesCount = await _dashboardRespository.GetEmployeesCount(request);
            return new ApiResponseModel<EmployeesCountResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, employeesCount);
        }

        public async Task<ApiResponseModel<IEnumerable<PublishedCompanyPolicyResponseDto>>> GetPublishedCompanyPolicies(DashboardRequestDto request)
        {
            if (!IsFilterValid(request))
            {
                return new ApiResponseModel<IEnumerable<PublishedCompanyPolicyResponseDto>>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidFilter, null);
            }
            var companyPolicies = await _dashboardRespository.GetPublishedCompanyPolicies(request);
            if (companyPolicies != null && companyPolicies.Any())
                return new ApiResponseModel<IEnumerable<PublishedCompanyPolicyResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, companyPolicies!);
            return new ApiResponseModel<IEnumerable<PublishedCompanyPolicyResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NoPublishedCompanyPolicies, null);
        }
        private static bool IsFilterValid(DashboardRequestDto filter)
        {
            bool hasDays = filter.Days > 0;
            bool hasCustomFilter = filter.From.HasValue && filter.To.HasValue;

            if ((hasDays && hasCustomFilter) || (!hasDays && !hasCustomFilter))
            {
                return false;
            }
            return true;
        }

        public async Task<ApiResponseModel<IEnumerable<WorkAnniversaryResponseDto>>> GetEmployeesWorkAnniversaryList()
        {
            var response = await _dashboardRespository.GetEmployeeWorkAnniversaryList();
            if (response != null && response.Any())
            {
                var path = Path.Combine(_environment.WebRootPath, _filePathOption.ProfileDirectoryLocation);
                foreach (var item in response)
                {
                    if (item != null && !string.IsNullOrEmpty(item.ProfilePicPath))
                        item.ProfilePicPath = path + item.ProfilePicPath;
                }
                return new ApiResponseModel<IEnumerable<WorkAnniversaryResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, response);
            }
            else
            {
                return new ApiResponseModel<IEnumerable<WorkAnniversaryResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NoWorkAnniversaryExists, null);
            }
        }
        public async Task<ApiResponseModel<HolidayResponseDto>> GetHolidayList()
        {
            var response = await _downTownClient.GetHolidayListAsync();
            if (response != null)
            {
                if (response.status)
                {
                    if (response.data.holidays != null && response.data.holidays.India.Any() && response.data.holidays.USA.Any())
                    {
                        var indiaList = _mapper.Map<List<HolidayDto>>(response.data.holidays.India);
                        var usaList = _mapper.Map<List<HolidayDto>>(response.data.holidays.USA);
                        HolidayResponseDto holidayResponseDto = new();
                        holidayResponseDto.India.AddRange(indiaList);
                        holidayResponseDto.USA.AddRange(usaList);
                        return new ApiResponseModel<HolidayResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, holidayResponseDto);
                    }
                    else
                        return new ApiResponseModel<HolidayResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
                }
                else
                    return new ApiResponseModel<HolidayResponseDto>((int)HttpStatusCode.InternalServerError, response.message, null);
            }
            else
                return new ApiResponseModel<HolidayResponseDto>((int)HttpStatusCode.InternalServerError, ErrorMessage.Internal, null);
        }

        public async Task<ApiResponseModel<HolidayResponseDto>> GetUpcomingHolidayList()
        {
            var response = await _downTownClient.GetUpcomingHolidayListAsync();
            if (response != null)
            {
                if (response.status)
                {
                    if (response.data.upcomingHolidays != null && response.data.upcomingHolidays.India.Any() && response.data.upcomingHolidays.USA.Any())
                    {
                        var indiaList = _mapper.Map<List<HolidayDto>>(response.data.upcomingHolidays.India);
                        var usaList = _mapper.Map<List<HolidayDto>>(response.data.upcomingHolidays.USA);
                        HolidayResponseDto holidayResponseDto = new();
                        holidayResponseDto.India.AddRange(indiaList);
                        holidayResponseDto.USA.AddRange(usaList);
                        return new ApiResponseModel<HolidayResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, holidayResponseDto);
                    }
                    else
                        return new ApiResponseModel<HolidayResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
                }
                else
                    return new ApiResponseModel<HolidayResponseDto>((int)HttpStatusCode.InternalServerError, response.message, null);
            }
            else
                return new ApiResponseModel<HolidayResponseDto>((int)HttpStatusCode.InternalServerError, ErrorMessage.Internal, null);
        }

        public async Task<ApiResponseModel<List<UpComingEventResponseDto>>> GetUpComingEventsList()
        { 
            var request = _httpContextAccessor.HttpContext.Request;
            var upComingEventList = await _dashboardRespository.GetUpComingEventsListAsync(); 
            if (upComingEventList != null && upComingEventList.Any())
            { 
                foreach (var item in upComingEventList)
                {
                    item.BannerFileName = $"{request.Scheme}://{request.Host}/Images/EventBanner/{item.BannerFileName}";
                }
                var upComingEventDto = _mapper.Map<List<UpComingEventResponseDto>>(upComingEventList);
                return new ApiResponseModel<List<UpComingEventResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, upComingEventDto);
            }
            else
            {
                return new ApiResponseModel<List<UpComingEventResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }
    }
}
