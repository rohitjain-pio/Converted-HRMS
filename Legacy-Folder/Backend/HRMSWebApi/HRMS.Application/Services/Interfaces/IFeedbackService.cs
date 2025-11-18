using HRMS.Domain.Enums;
using HRMS.Models;

namespace HRMS.Application.Services.Interfaces
{
    public interface IFeedbackService
    {
        Task<ApiResponseModel<CrudResult>> AddFeedback(FeedbackRequestDto requestDto);
        Task<ApiResponseModel<FeedbackResponseDto>> GetFeedbackById(long id);
        Task<ApiResponseModel<FeedbackListResponseDto>> GetFeedbackList(SearchRequestDto<FeedbackSearchRequestDto> searchRequestDto);
        Task<ApiResponseModel<FeedbackByEmployeeListResponseDto>> GetFeedbackByEmployee(SearchRequestDto<FeedbackSearchRequestDto> searchRequestDto);
        Task<ApiResponseModel<CrudResult>> ModifyFeedbackStatus(ModifyFeedbackStatusRequestDto requestDto);
    }
}
