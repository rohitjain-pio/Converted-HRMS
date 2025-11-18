using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Event;

namespace HRMS.Application.Services.Interfaces
{
    public interface IEventService
    {
        Task<ApiResponseModel<EventResponseDto>> Add(EventRequestDto eventRequestDto);
        Task<ApiResponseModel<EventResponseDto>> Update(EventRequestDto eventRequestDto);
        Task<ApiResponseModel<EventSearchResponseDto>> GetEvents(SearchRequestDto<EventSearchRequestDto> requestDto);
        Task<ApiResponseModel<EventResponseDto>> GetEventById(long id);
        Task<ApiResponseModel<CrudResult>> Delete(long id);
        Task<ApiResponseModel<List<EventCategoryResponseDto>>> GetEventCategoryList();
        Task<ApiResponseModel<CrudResult>> DeleteEventDocument(long id);
        Task<ApiResponseModel<CrudResult>> UpdateEventStatus(long id, int statusId);
    }
}