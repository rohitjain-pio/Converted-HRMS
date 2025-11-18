using AutoMapper;
using HRMS.Application.Clients;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Configurations;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Domain.Utility;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models.Event;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System.Net;

namespace HRMS.Application.Services
{
    public class EventService : TokenService, IEventService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly FilePathOptions _filePathOptions;
        private readonly IHostingEnvironment _environment;
        private readonly AppConfigOptions _appConfig;
        private readonly IMapper _mapper;
        private readonly BlobStorageClient _blobStorageClient;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly List<string> _AllowedFileExtensions = new List<string>() { ".pdf", ".doc", ".docx" };
        private const string FileTimestampFormat = "ddMMyyyyHHmmss";

        public EventService(IUnitOfWork unitOfWork, IOptions<AppConfigOptions> appConfig, BlobStorageClient blobStorageClient, IMapper mapper, IOptions<FilePathOptions> filePathOptions, IHostingEnvironment environment, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _filePathOptions = filePathOptions.Value;
            _environment = environment;
            _appConfig = appConfig.Value;
            _mapper = mapper;
            _blobStorageClient = blobStorageClient;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<ApiResponseModel<EventSearchResponseDto>> GetEvents(SearchRequestDto<EventSearchRequestDto> requestDto)
        {
           // var c = RoleId; getting roleid from token service
            var eventSearchList = await _unitOfWork.EventRepository.GetEvents(requestDto);
            if (eventSearchList != null && eventSearchList.EventList.Any())
            {
                var request = _httpContextAccessor.HttpContext.Request;
                foreach (var item in eventSearchList.EventList)
                {
                    item.BannerFileName = $"{request.Scheme}://{request.Host}/Images/EventBanner/{item.BannerFileName}";
                }

                return new ApiResponseModel<EventSearchResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, eventSearchList);
            }
            else
            {
                return new ApiResponseModel<EventSearchResponseDto>((int)HttpStatusCode.OK, ErrorMessage.NotFoundMessage, null);
            }
        }
        public async Task<ApiResponseModel<CrudResult>> Delete(long id)
        {
            var eventsResponse = await _unitOfWork.EventRepository.GetEventByIdAsync(id);
            if (eventsResponse != null)
            {
                Event events = new();
                events.Id = id;
                events.ModifiedBy = UserEmailId;
                await _unitOfWork.EventRepository.DeleteAsync(events);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<EventResponseDto>> GetEventById(long id)
        {
            var eventResponse = await _unitOfWork.EventRepository.GetEventByIdAsync(id);
            if (eventResponse != null)
            {
                var request = _httpContextAccessor.HttpContext.Request;
                eventResponse.BannerFileName = $"{request.Scheme}://{request.Host}/Images/EventBanner/{eventResponse.BannerFileName}";

                foreach (var item in eventResponse.eventDocument)
                {
                    item.FileName = $"{request.Scheme}://{request.Host}/Documents/Event/{item.FileName}";
                }
                return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, eventResponse);
            }
            else
            {
                return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<EventResponseDto>> Add(EventRequestDto eventRequestDto)
        {
            bool isDocSaved = true;
            bool isBannerSaved = true;
            string bannerFile = string.Empty;

            List<EventDocument> listEventDocument = new();
            try
            {
                if (eventRequestDto.BannerFileContent != null)
                {
                    string bannerFileName = Path.GetFileNameWithoutExtension(eventRequestDto.BannerFileContent.FileName);
                    string fileExtension = Path.GetExtension(eventRequestDto.BannerFileContent.FileName);
                    if (!string.IsNullOrEmpty(fileExtension))
                    {
                        bannerFile = bannerFileName + "_" + DateTime.UtcNow.ToString(FileTimestampFormat) + fileExtension;
                        isBannerSaved = await CreateEventDocument(eventRequestDto.BannerFileContent, bannerFile, _filePathOptions.EventBannerDirectoryLocation);
                    }
                    else
                    {
                        DeleteBannerImage(bannerFile);
                        return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.FileTypeIsNotSupport, null);
                    }
                }
                else
                {
                    return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.CompanyPolicyDocRequered, null);
                }

                if (eventRequestDto.FileContent != null)
                {
                    var item = eventRequestDto.FileContent;
                    EventDocument eventDocument = new();
                    if (item != null)
                    {
                        string fileName = Path.GetFileNameWithoutExtension(eventRequestDto.FileContent.FileName);
                        string fileExtension = Path.GetExtension(eventRequestDto.FileContent.FileName);
                        if (!string.IsNullOrEmpty(fileExtension) && _AllowedFileExtensions.Contains(fileExtension.ToLower()))
                        {
                            eventDocument.FileName = fileName + "_" + DateTime.UtcNow.ToString(FileTimestampFormat) + fileExtension;
                            eventDocument.OriginalFileName = eventRequestDto.FileContent.FileName;
                            eventDocument.CreatedOn = DateTime.UtcNow;
                            eventDocument.CreatedBy = UserEmailId!;
                            listEventDocument.Add(eventDocument);
                            if (eventRequestDto.FileContent.Length < _appConfig.PolicyDocumentMaxSize)
                            {
                                isDocSaved = await CreateEventFileDocument(eventRequestDto.FileContent, eventDocument.FileName);
                            }
                            else
                            {
                                return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidPolicyMaxSize, null);
                            }
                        }
                        else
                        {
                            DeleteBannerImage(bannerFile);
                            DeleteDocument(listEventDocument);
                            return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.FileTypeIsNotSupport, null);
                        }
                    }
                    else
                    {
                        DeleteBannerImage(bannerFile);
                        DeleteDocument(listEventDocument);
                        return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.FileTypeIsNotSupport, null);
                    }
                }
            }
            catch (System.Exception)
            {
                DeleteBannerImage(bannerFile);
                DeleteDocument(listEventDocument);
                return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.FileTypeIsNotSupport, null);
            }

            if (isDocSaved && isBannerSaved)
            {
                var eventData = _mapper.Map<Event>(eventRequestDto);

                eventData.BannerFileName = bannerFile;
                eventData.CreatedBy = UserEmailId;
                eventData.CreatedOn = DateTime.UtcNow;

                var res = await _unitOfWork.EventRepository.AddEventAsync(eventData, listEventDocument);

                if (res <= 0)
                {
                    DeleteBannerImage(bannerFile);
                    DeleteDocument(listEventDocument);
                    return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.ErrorInSavingFile, null);
                }
                return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.OK, SuccessMessage.EventAdded, null);
            }
            else
            {
                return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.ErrorInSavingFile, null);
            }
        }

        public async Task<ApiResponseModel<EventResponseDto>> Update(EventRequestDto eventRequestDto)
        {
            
            bool isBannerSaved = true;
            string bannerFile = string.Empty;

            var eventResponse = await _unitOfWork.EventRepository.GetEventByIdAsync(eventRequestDto.Id);
            var eventData = _mapper.Map<Event>(eventRequestDto);
            List<EventDocument> listEventDocument = new();
            try
            {
                if (eventRequestDto.BannerFileContent != null)
                {
                    string bannerFileName = Path.GetFileNameWithoutExtension(eventRequestDto.BannerFileContent.FileName);
                    string fileExtension = Path.GetExtension(eventRequestDto.BannerFileContent.FileName);
                    if (!string.IsNullOrEmpty(fileExtension))
                    {
                        bannerFile = bannerFileName + "_" + DateTime.UtcNow.ToString(FileTimestampFormat) + fileExtension;
                        isBannerSaved = await CreateEventDocument(eventRequestDto.BannerFileContent, bannerFile, _filePathOptions.EventBannerDirectoryLocation);
                        if (isBannerSaved)
                        {
                            eventData.BannerFileName = bannerFile;
                        }
                    }
                    else
                    {
                        DeleteBannerImage(bannerFile);
                        return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.FileTypeIsNotSupport, null);
                    }
                }

                if (eventRequestDto.FileContent != null)
                {
                    var item = eventRequestDto.FileContent;

                    EventDocument eventDocument = new();
                    if (item != null)
                    {
                        string fileName = Path.GetFileNameWithoutExtension(item.FileName);
                        string fileExtension = Path.GetExtension(item.FileName);
                        if (!string.IsNullOrEmpty(fileExtension))
                        {
                            eventDocument.FileName = fileName + "_" + DateTime.UtcNow.ToString(FileTimestampFormat) + fileExtension;
                            eventDocument.OriginalFileName = item.FileName;
                            eventDocument.CreatedOn = DateTime.UtcNow;
                            eventDocument.CreatedBy = UserEmailId!;
                            eventDocument.EventId = eventRequestDto.Id;
                            listEventDocument.Add(eventDocument);
                            await CreateEventFileDocument(eventRequestDto.FileContent, eventDocument.FileName);

                        }
                        else
                        {
                            DeleteBannerImage(bannerFile);
                            DeleteDocument(listEventDocument);
                            return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.FileTypeIsNotSupport, null);
                        }
                    }
                    else
                    {
                        DeleteBannerImage(bannerFile);
                        DeleteDocument(listEventDocument);
                        return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.FileTypeIsNotSupport, null);
                    }

                }

                eventData.ModifiedBy = UserEmailId;
                eventData.ModifiedOn = DateTime.UtcNow;
                var res = await _unitOfWork.EventRepository.UpdateEventAsync(eventData, listEventDocument);
                if (res > 0)
                {
                    if (!string.IsNullOrWhiteSpace(eventData!.BannerFileName) && !string.IsNullOrWhiteSpace(eventResponse.BannerFileName))
                    {
                        await _blobStorageClient.DeleteFile(eventResponse.BannerFileName, BlobContainerConstants.UserDocumentContainer);
                    }
                    return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.OK, SuccessMessage.EventUpdated, null);
                }
                else
                {
                    DeleteBannerImage(bannerFile);
                    DeleteDocument(listEventDocument);
                    return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.ErrorInSavingFile, null);
                }
            }
            catch (System.Exception)
            {
                DeleteBannerImage(bannerFile);
                DeleteDocument(listEventDocument);
                return new ApiResponseModel<EventResponseDto>((int)HttpStatusCode.BadRequest, ErrorMessage.FileTypeIsNotSupport, null);
            }
        }

        private async Task<bool> CreateEventDocument(IFormFile fileContent, string fileName, string location)
        {
            var filePath = Path.Combine(this._environment.WebRootPath, location);
            string fileActualLocation = Path.GetFullPath(filePath + fileName);
            if (fileActualLocation.StartsWith(Path.GetFullPath(filePath), StringComparison.OrdinalIgnoreCase))
            {
                if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(filePath);
                }
                using (Stream fileStream = new FileStream(filePath + fileName, FileMode.Create))
                {
                    await fileContent.CopyToAsync(fileStream);
                }
                return true;
            }
            return false;
        }
        private async Task<bool> CreateEventFileDocument(IFormFile fileContent, string fileName)
        {
            var filePath = Path.Combine(this._environment.WebRootPath, _filePathOptions.EventDirectoryLocation);
            string fileActualLocation = Path.GetFullPath(filePath + fileName);
            if (fileActualLocation.StartsWith(Path.GetFullPath(filePath), StringComparison.OrdinalIgnoreCase))
            {
                if (!Directory.Exists(filePath))
                {
                    Directory.CreateDirectory(filePath);
                }
                using (Stream fileStream = new FileStream(filePath + fileName, FileMode.Create))
                {
                    await fileContent.CopyToAsync(fileStream);
                }
                return true;
            }
            return false;
        }

        private void DeleteDocument(List<EventDocument> listFileName)
        {
            var filePath = Path.Combine(this._environment.WebRootPath, _filePathOptions.EventDirectoryLocation);
            listFileName
                .Where(item =>
                    Path.GetFullPath(filePath + item.FileName)
                        .StartsWith(Path.GetFullPath(filePath), StringComparison.OrdinalIgnoreCase))
                .ToList()
                .ForEach(item => Helper.DeleteFile(item.FileName, filePath));

        }
        private void DeleteBannerImage(string fileName)
        {
            var filePath = Path.Combine(this._environment.WebRootPath, _filePathOptions.EventBannerDirectoryLocation);
            string fileActualLocation = Path.GetFullPath(filePath + fileName);

            if (fileActualLocation.StartsWith(Path.GetFullPath(filePath), StringComparison.OrdinalIgnoreCase))
            {
                 Helper.DeleteFile(fileName, filePath);
            }

        }

        public async Task<ApiResponseModel<List<EventCategoryResponseDto>>> GetEventCategoryList()
        {
            var eventCategroyResponseDto = await _unitOfWork.EventRepository.GetEventCategoryListAsync();

            if (eventCategroyResponseDto != null && eventCategroyResponseDto.Any())
            {
                var eventCategoryDto = _mapper.Map<List<EventCategoryResponseDto>>(eventCategroyResponseDto);

                return new ApiResponseModel<List<EventCategoryResponseDto>>((int)HttpStatusCode.OK, SuccessMessage.Success, eventCategoryDto);
            }
            else
            {
                return new ApiResponseModel<List<EventCategoryResponseDto>>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> DeleteEventDocument(long id)
        {
            var eventDocumentResponse = await _unitOfWork.EventRepository.GetEventDocumentByIdAsync(id);
            if (eventDocumentResponse != null)
            {
                EventDocument eventDocument = new();
                eventDocument.Id = id;
                eventDocument.EventId = eventDocumentResponse.EventId;
                eventDocument.ModifiedBy = UserEmailId;
                var result = await _unitOfWork.EventRepository.DeleteEventDocumentAsync(eventDocument);
                if (result > 0)
                {
                    List<EventDocument> listEventDocument = new();
                    listEventDocument.Add(eventDocument);
                    DeleteDocument(listEventDocument);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<CrudResult>> UpdateEventStatus(long id, int statusId)
        {
            var eventResponse = await _unitOfWork.EventRepository.GetEventByIdAsync(id);
            if (eventResponse != null)
            {
                Event events = new();
                events.Id = id;
                events.StatusId = statusId;
                events.ModifiedBy = UserEmailId;
                var result = await _unitOfWork.EventRepository.UpdateEventStatusAsync(events);
                if (result > 0)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }        
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }
    }
}