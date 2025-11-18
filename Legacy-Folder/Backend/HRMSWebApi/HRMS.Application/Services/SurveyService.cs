using AutoMapper;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models;
using HRMS.Models.Models.Survey;
using Microsoft.AspNetCore.Http;
using System.Net;
using SurveyStatus = HRMS.Domain.Enums.SurveyStatus;

namespace HRMS.Application.Services
{
    public class SurveyService : TokenService, ISurveyService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public SurveyService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }    

        public async Task<ApiResponseModel<CrudResult>> AddSurvey(SurveyRequestDto request)
        {
            if (request == null)   
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            var surveyInfo = _mapper.Map<Survey>(request);
            surveyInfo.CreatedBy = UserEmailId!;
            surveyInfo.CreatedOn = DateTime.UtcNow;
            await _unitOfWork.SurveyRepository.AddAsync(surveyInfo);
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
        }      

        public async Task<ApiResponseModel<CrudResult>> DeleteSurvey(long id)
        {
            if (id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, CrudResult.Failed);
            }                     
            var surveyResponse = await _unitOfWork.SurveyRepository.GetByIdAsync(id);
            if (surveyResponse != null)
            {                   
                Survey survey = new();                                                           
                survey.ModifiedBy = UserEmailId;
                survey.Id = id;        
                var sucess = await _unitOfWork.SurveyRepository.DeleteAsync(survey);
                if (sucess > 0)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.RecordNotDeleted, CrudResult.Failed);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }
        public async Task<ApiResponseModel<IEnumerable<SurveyStatusResponseDto>>> GetSurveyStatusList()
        {
            var surveyStatusResponse = await _unitOfWork.SurveyRepository.GetSurveyStatus();
            if (surveyStatusResponse != null && surveyStatusResponse.Any())
            {
                var surveyStatusList = _mapper.Map<List<SurveyStatusResponseDto>>(surveyStatusResponse);

                return new ApiResponseModel<IEnumerable<SurveyStatusResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, surveyStatusList);
            }
            else
            {
                return new ApiResponseModel<IEnumerable<SurveyStatusResponseDto>>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<SurveyResponseDto>> GetSurveyDetailsById(long id)
        {
            var surveyResponse = await _unitOfWork.SurveyRepository.GetSurveyDetailsByIdAsync(id);
            if (surveyResponse != null)
            {
                return new ApiResponseModel<SurveyResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, surveyResponse);
            }
            else                                                                               
            {
                return new ApiResponseModel<SurveyResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }
                                                          
        public async Task<ApiResponseModel<CrudResult>> UpdateSurvey(SurveyRequestDto request)
        {
            var response = await _unitOfWork.SurveyRepository.GetByIdAsync(request.Id);
            if (response == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            if (response.StatusId == (int)SurveyStatus.Draft)
            {
                var surveyInfo = _mapper.Map<Survey>(request);               
                surveyInfo.ModifiedBy = UserEmailId;
                surveyInfo.ModifiedOn = DateTime.UtcNow;
                await _unitOfWork.SurveyRepository.UpdateAsync(surveyInfo);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.DraftSurvey, CrudResult.Failed);
        }
        public async Task<ApiResponseModel<CrudResult>> PublishSurvey(PublishSurveyRequestDto publishSurveyRequestDto)
        {
            if (publishSurveyRequestDto.Id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, CrudResult.Failed);
            }
            var surveyResponse = await _unitOfWork.SurveyRepository.GetByIdAsync(publishSurveyRequestDto.Id);
            if (surveyResponse != null)
            {
                if (surveyResponse.StatusId == (int)SurveyStatus.Draft)
                {
                    await _unitOfWork.SurveyRepository.PublishSurvey(publishSurveyRequestDto);
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);

                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.SurveyInDraft, CrudResult.Failed);

            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<CrudResult>> AddSurveyAnswer(SurveyAnswerRequestDto request)
        {
            if (request == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.RequestNull, CrudResult.Failed);
            }
            var surveyTemplate = await _unitOfWork.SurveyRepository.GetByIdAsync(request.SurveyId);
            if (surveyTemplate == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.SurveyNotFound, CrudResult.Failed);
            }
            var employeeSurveyResponseInfo = await _unitOfWork.SurveyRepository.GetSurveyResponseByEmpIdAsync(request.EmployeeId,request.SurveyId);
            if(employeeSurveyResponseInfo == null)
            {
                var surveyResponseInfo = _mapper.Map<SurveyResponse>(request);
                surveyResponseInfo.CreatedBy = UserEmailId!;
                surveyResponseInfo.CreatedOn = DateTime.UtcNow;
                surveyTemplate.ResponsesCount += 1;
                surveyTemplate.ModifiedBy = UserEmailId;
                surveyTemplate.ModifiedOn = DateTime.UtcNow;
                var result =  await _unitOfWork.SurveyRepository.AddSurveyAnswer(surveyResponseInfo, surveyTemplate);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.AlreadySubmittedSurvey, CrudResult.Failed);
        }
        public async Task<ApiResponseModel<SurveySearchResponseDto>> GetSurveyList(SearchRequestDto<SurveySearchRequestDto> requestDto)
        {
            var surveySearchList = await _unitOfWork.SurveyRepository.GetSurveyListAsync(requestDto);
            if (surveySearchList != null && surveySearchList.SurveyResponseList.Any())
            {
                return new ApiResponseModel<SurveySearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, surveySearchList);
            }
            else
            {
                return new ApiResponseModel<SurveySearchResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }

    }
}
