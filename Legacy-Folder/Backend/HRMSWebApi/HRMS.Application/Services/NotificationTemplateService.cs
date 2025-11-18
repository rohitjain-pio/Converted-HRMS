using AutoMapper;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models.NotificationTemplate;
using Microsoft.AspNetCore.Http;
using System.Net;

namespace HRMS.Application.Services
{
    public class NotificationTemplateService : TokenService, INotificationTemplateService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public NotificationTemplateService(IUnitOfWork unitOfWork, IMapper mapper, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ApiResponseModel<CrudResult>> AddEmailTemplate(EmailTemplateUpdateRequestDto request)
        {
            if (request == null)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);

            var info = _mapper.Map<NotificationTemplate>(request);
            info.Status = 0;//setting status to inactive for new template
            info.CreatedBy = UserEmailId!;
            info.CreatedOn = DateTime.UtcNow;
            await _unitOfWork.NotificationTemplateRepository.AddAsync(info);
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
        }

        public async Task<ApiResponseModel<EmailTemplateSearchResponseDto>> FilterEmailTemplates(SearchRequestDto<EmailTemplateSearchRequestDto> requestDto)
        {
            var result = await _unitOfWork.NotificationTemplateRepository.FilterEmailTemplatesAsync(requestDto);
            if (result == null)
                return new ApiResponseModel<EmailTemplateSearchResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);

            return new ApiResponseModel<EmailTemplateSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, result);
        }

        public async Task<ApiResponseModel<NotificationTemplate>> GetEmailTemplateById(long id)
        {
            var result = await _unitOfWork.NotificationTemplateRepository.GetByIdAsync(id);

            if (result == null)
                return new ApiResponseModel<NotificationTemplate>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);

            return new ApiResponseModel<NotificationTemplate>((int)HttpStatusCode.OK, SuccessMessage.Success, result);
        }

        public async Task<ApiResponseModel<List<EmailTemplateDto>>> GetEmailTemplateNameList()
        {
            var list = Enum.GetValues(typeof(EmailTemplateTypes))
                        .Cast<EmailTemplateTypes>()
                        .Select(e => new EmailTemplateDto
                        {
                            Id = (int)e,
                            Name = e.ToString()
                        })
                        .ToList();

            return new ApiResponseModel<List<EmailTemplateDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, list);
        }

        public async Task<ApiResponseModel<CrudResult>> UpdateEmailTemplate(EmailTemplateUpdateRequestDto request)
        {
            var response = await _unitOfWork.NotificationTemplateRepository.GetByIdAsync(request.Id);
            if (response == null)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);

            var info = _mapper.Map<NotificationTemplate>(request);
            info.Id = request.Id;
            info.ModifiedBy = UserEmailId;
            info.ModifiedOn = DateTime.UtcNow;
            await _unitOfWork.NotificationTemplateRepository.UpdateAsync(info);
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
        }

        public async Task<ApiResponseModel<CrudResult>> ToggleEmailTemplateStatus(long id)
        {
            var template = await _unitOfWork.NotificationTemplateRepository.GetByIdAsync(id);
            if (template == null)
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            if (template.Status == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            var isAnotherActive = await _unitOfWork.NotificationTemplateRepository.IsAnotherTemplateActive(template.Type, id);
            if (template.Status == EmailTemplateStatus.InActive && isAnotherActive)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.Conflict, ErrorMessage.AlreadyActive, CrudResult.Failed);
            }

            await _unitOfWork.NotificationTemplateRepository.ChangeEmailTemplateStatus(
                id,
                template.Status == EmailTemplateStatus.Active ? EmailTemplateStatus.InActive : EmailTemplateStatus.Active
            );

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
        }


        public async Task<ApiResponseModel<NotificationTemplate?>> GetDefaultEmailTemplate(EmailTemplateTypes type)
        {
            var result = await _unitOfWork.NotificationTemplateRepository.GetDefaultEmailTemplateAsync(type);
            if (result == null)
            {
                return new ApiResponseModel<NotificationTemplate?>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }

            return new ApiResponseModel<NotificationTemplate?>((int)HttpStatusCode.OK, SuccessMessage.Success, result);
        }

        public async Task<ApiResponseModel<CrudResult>> DeleteTemplateAsync(long id)
        {
            var result = await _unitOfWork.NotificationTemplateRepository.DeleteTemplateAsync(id);

            if (result)
            {
                return new ApiResponseModel<CrudResult>(
                    (int)HttpStatusCode.OK,
                    SuccessMessage.Success,
                    CrudResult.Success
                );
            }

            return new ApiResponseModel<CrudResult>(
                (int)HttpStatusCode.NotFound,
                ErrorMessage.NotFoundMessage,
                CrudResult.Failed
            );
        }


    }
}
