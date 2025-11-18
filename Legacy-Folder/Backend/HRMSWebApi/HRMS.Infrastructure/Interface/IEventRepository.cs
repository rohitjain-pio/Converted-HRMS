using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Models.Models.Event;

namespace HRMS.Infrastructure.Interface
{
    public interface IEventRepository: IGenericRepository<Event>
    {
        Task<int> AddEventAsync(Event addEvent, List<EventDocument> eventDocumentList);
        Task<int> UpdateEventAsync(Event updateEvent, List<EventDocument> eventDocumentList);
        Task<EventSearchResponseDto> GetEvents(SearchRequestDto<EventSearchRequestDto> requestDto);
        Task<EventResponseDto?> GetEventByIdAsync(long id);
        Task<IEnumerable<EventCategory?>> GetEventCategoryListAsync();
        Task<EventDocumentResponseDto?> GetEventDocumentByIdAsync(long id);
        Task<int> DeleteEventDocumentAsync(EventDocument eventDocument);
        Task<int> UpdateEventStatusAsync(Event events);
    }
}