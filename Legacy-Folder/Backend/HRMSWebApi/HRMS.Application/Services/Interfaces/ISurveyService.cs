using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Survey;
using HRMS.Models.Models;

namespace HRMS.Application.Services.Interfaces
{
    public interface ISurveyService
    {
        Task<ApiResponseModel<CrudResult>> AddSurvey(SurveyRequestDto request);
        Task<ApiResponseModel<CrudResult>> DeleteSurvey(long id);
        Task<ApiResponseModel<SurveyResponseDto>> GetSurveyDetailsById(long id);
        Task<ApiResponseModel<CrudResult>> UpdateSurvey(SurveyRequestDto request);
        Task<ApiResponseModel<IEnumerable<SurveyStatusResponseDto>>> GetSurveyStatusList();
        Task<ApiResponseModel<CrudResult>> PublishSurvey(PublishSurveyRequestDto publishSurveyRequestDto);
        Task<ApiResponseModel<CrudResult>> AddSurveyAnswer(SurveyAnswerRequestDto request);
        Task<ApiResponseModel<SurveySearchResponseDto>> GetSurveyList(SearchRequestDto<SurveySearchRequestDto> requestDto);
       
        }
}
