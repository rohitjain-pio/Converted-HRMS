using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Models;
using System.Net;
using HRMS.Infrastructure;
using Microsoft.AspNetCore.Http;
using HRMS.Models.Models.Log;
using HRMS.Models.Models.DevTools;

namespace HRMS.Application.Services
{
    public class DevToolService : TokenService, IDevToolService
    {
        private readonly IUnitOfWork _unitOfWork;
        public DevToolService(IUnitOfWork unitOfWork,IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
             _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponseModel<LogsListDto>> GetAllLogs(SearchRequestDto<LogSearchRequestDto> requestDto)
        {
            var result = await _unitOfWork.DevToolRepository.GetAllLogsAsync(requestDto);

            if (result != null)
            {
                return new ApiResponseModel<LogsListDto>((int)HttpStatusCode.OK,SuccessMessage.Success,result);
            }

            return new ApiResponseModel<LogsListDto>((int)HttpStatusCode.OK,ErrorMessage.NotFoundMessage,null);
        }

        public async Task<ApiResponseModel<CronLogListDto>> GetCronLogs(SearchRequestDto<CronLogSearchRequestDto> requestDto)
        {
            var result = await _unitOfWork.DevToolRepository.GetCronLogs(requestDto);

            if (result != null)
            {
                return new ApiResponseModel<CronLogListDto>((int)HttpStatusCode.OK, SuccessMessage.Success, result);
            }

            return new ApiResponseModel<CronLogListDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
        }
        public async Task<ApiResponseModel<CronLogResponseDto>> GetCronLogById(long id)
        {
            var result = await _unitOfWork.DevToolRepository.GetCronLogs(new SearchRequestDto<CronLogSearchRequestDto> 
            { 
                PageSize = 1, 
                StartIndex = 0, 
                Filters = new CronLogSearchRequestDto
                {
                    Id = id
                }
            });

            if (result != null && result.CronLogsList != null)
            {
                return new ApiResponseModel<CronLogResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, result.CronLogsList.FirstOrDefault());
            }

            return new ApiResponseModel<CronLogResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
        }
        public async Task<ApiResponseModel<long>> UpsertCronLog(CronLog cronDto)
        {
            var result = await _unitOfWork.DevToolRepository.CreateCronLog(cronDto);

            if (result != null)
            {
                return new ApiResponseModel<long>((int)HttpStatusCode.OK, SuccessMessage.Success, result);
            }

            return new ApiResponseModel<long>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, 0);
        }

    }
}