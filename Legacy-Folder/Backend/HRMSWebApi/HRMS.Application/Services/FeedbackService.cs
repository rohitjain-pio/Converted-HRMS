
using System.Net;
using AutoMapper;
using HRMS.Application.Clients;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using HRMS.Infrastructure.Interface;
using HRMS.Models;
using Microsoft.AspNetCore.Http;


namespace HRMS.Application.Services
{
    public class FeedbackService : TokenService,IFeedbackService
    {
      
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly BlobStorageClient _blobStorageClient;
        private readonly IEmailNotificationService _email;
        public FeedbackService(IUnitOfWork unitOfWork,IMapper mapper,IHttpContextAccessor httpContextAccessor, BlobStorageClient blobStorageClient, IEmailNotificationService email): base(httpContextAccessor)
        {
           
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _blobStorageClient = blobStorageClient;
            _email = email;
        }

        public async Task<ApiResponseModel<CrudResult>> AddFeedback(FeedbackRequestDto requestDto)
        {
            if (requestDto == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidRequest, CrudResult.Failed);
            }
            var feedback = _mapper.Map<Feedback>(requestDto);
            if (requestDto.Attachment != null)
            {
                var fileName = await _blobStorageClient.UploadFile(requestDto.Attachment, (long)SessionUserId!,
                        BlobContainerConstants.UserDocumentContainer);

                feedback.AttachmentPath = fileName;
                feedback.FileOriginalName = requestDto.Attachment.FileName;
            }
            feedback.CreatedBy = UserEmailId!;
            feedback.CreatedOn = DateTime.UtcNow;
            long ticketId = await _unitOfWork.FeedbackRepository.AddFeedbackAsync(feedback);
            await _email.FeedbackSubmittedEmailAsync(ticketId);

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.FeedbackAdded, CrudResult.Success);
        }

        public async Task<ApiResponseModel<FeedbackByEmployeeListResponseDto>> GetFeedbackByEmployee(SearchRequestDto<FeedbackSearchRequestDto> searchRequestDto)
        {
            var feedbacks = await _unitOfWork.FeedbackRepository.GetFeedbackByEmployeeAsync((int)SessionUserId!, searchRequestDto);
            if (feedbacks != null)
            {
                return new ApiResponseModel<FeedbackByEmployeeListResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, feedbacks);
            }

            return new ApiResponseModel<FeedbackByEmployeeListResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
        }

        public async Task<ApiResponseModel<FeedbackResponseDto>> GetFeedbackById(long id)
        {
            if (id <= 0)
                return new ApiResponseModel<FeedbackResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidRequest, null);
            

            var feedback = await _unitOfWork.FeedbackRepository.GetFeedbackByIdAsync(id);
            if (feedback == null)
                return new ApiResponseModel<FeedbackResponseDto>((int)HttpStatusCode.OK, ErrorMessage.FeedbackNotFound, null);

            
            return new ApiResponseModel<FeedbackResponseDto>((int)HttpStatusCode.OK, SuccessMessage.FeedbackRetrieved, feedback);
        }

        public async Task<ApiResponseModel<FeedbackListResponseDto>> GetFeedbackList(SearchRequestDto<FeedbackSearchRequestDto> searchRequestDto)
        {
            var feedbacks = await _unitOfWork.FeedbackRepository.GetAllFeedbackAsync(searchRequestDto);
            if (feedbacks != null)
            {
                return new ApiResponseModel<FeedbackListResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, feedbacks);
            }

            return new ApiResponseModel<FeedbackListResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
        }

        public async Task<ApiResponseModel<CrudResult>> ModifyFeedbackStatus(ModifyFeedbackStatusRequestDto requestDto)
        {
            var existingFeedback = await _unitOfWork.FeedbackRepository.GetFeedbackByIdAsync(requestDto.Id);
            if (existingFeedback == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.FeedbackNotFound, CrudResult.Failed);
            }
            var newFeedback = _mapper.Map<Feedback>(existingFeedback);
            newFeedback.TicketStatus = requestDto.TicketStatus;
            newFeedback.AdminComment = requestDto.AdminComment;
            newFeedback.ModifiedBy = UserEmailId!;
            newFeedback.ModifiedOn = DateTime.UtcNow;

            await _unitOfWork.FeedbackRepository.UpdateFeedbackAsync(newFeedback);
            // Send email notification for status change
            await _email.FeedbackStatusChangedEmailAsync(requestDto.Id);

            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.FeedbackStatusModified, CrudResult.Success);
        }
    }
}
