using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Models.Models.NotificationTemplate;
using HRMS.Models.Models.Survey;

namespace HRMS.Infrastructure.Interface
{
    public interface ISurveyRepository:IGenericRepository<Survey>
    {
        Task<SurveyResponseDto?> GetSurveyDetailsByIdAsync(long id);
        Task<int> AddSurveyAnswer(SurveyResponse surveyResponse, Survey survey);
        Task<SurveyResponse?> GetSurveyResponseByEmpIdAsync(long id, long surveyId);

        Task<IEnumerable<SurveyStatus>> GetSurveyStatus();
        Task<int> PublishSurvey(PublishSurveyRequestDto entity);
        Task<SurveySearchResponseDto> GetSurveyListAsync(SearchRequestDto<SurveySearchRequestDto> requestDto);
    }
}
