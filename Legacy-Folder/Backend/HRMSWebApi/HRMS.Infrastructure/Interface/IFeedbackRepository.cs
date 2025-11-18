using HRMS.Application;
using HRMS.Domain.Entities;
using HRMS.Models;


namespace HRMS.Infrastructure.Interface
{
    public interface IFeedbackRepository
    {
        Task<long> AddFeedbackAsync(Feedback request);
        Task<FeedbackResponseDto?> GetFeedbackByIdAsync(long id);
        Task<FeedbackListResponseDto?> GetAllFeedbackAsync(SearchRequestDto<FeedbackSearchRequestDto> requestDto);
        Task<FeedbackByEmployeeListResponseDto?> GetFeedbackByEmployeeAsync(int userSessionId, SearchRequestDto<FeedbackSearchRequestDto> requestDto);
        Task UpdateFeedbackAsync(Feedback feedback);
    }
}
