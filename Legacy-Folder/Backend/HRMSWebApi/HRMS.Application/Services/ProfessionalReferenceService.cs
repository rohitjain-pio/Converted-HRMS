using AutoMapper;
using HRMS.Application.Services.Interfaces;
using HRMS.Domain.Contants;
using HRMS.Domain.Entities;
using HRMS.Domain.Enums;
using HRMS.Infrastructure;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Http;
using System.Net;

namespace HRMS.Application.Services
{
    public class ProfessionalReferenceService : TokenService, IProfessionalReferenceService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        

        public ProfessionalReferenceService(IUnitOfWork unitOfWork, IMapper mapper,  IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;    
        }

        public async Task<ApiResponseModel<CrudResult>> AddProfessionalReference(List<ProfessionalReferenceRequestDto> professionalReference)
        {
            if (professionalReference == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            var previousEmployerId = professionalReference.Select(x => x.PreviousEmployerId).FirstOrDefault();
            var professionalReferenceCount = await _unitOfWork.ProfessionalReferenceRepository.GetReferenceCountAsync(previousEmployerId);
           
            if ((professionalReferenceCount + professionalReference.Count)<=3)
            {
                if((professionalReferenceCount + professionalReference.Count)<2)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidCount, CrudResult.Failed);
                }
                var profationalReferencesDto = _mapper.Map<List<ProfessionalReference>>(professionalReference);
                foreach (var item in profationalReferencesDto)
                {
                    item.CreatedBy = UserEmailId!;
                }

                await _unitOfWork.ProfessionalReferenceRepository.AddProfessionalReferenceAsync(profationalReferencesDto);
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.ProfessionalReferenceAdded, CrudResult.Success);
            }
            else
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.MaxProfessionalReference, CrudResult.Failed);
            }
        }

        public async Task<ApiResponseModel<CrudResult>> DeleteProfessionalReference(long id)
        {
            if (id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, CrudResult.Failed);
            }
            var professionalReference = await _unitOfWork.ProfessionalReferenceRepository.GetByIdAsync(id);
            if (professionalReference != null)
            {
                ProfessionalReference professionalReferences = new();
                professionalReferences.ModifiedBy = UserEmailId;
                professionalReferences.Id = id;
                var sucess = await _unitOfWork.ProfessionalReferenceRepository.DeleteAsync(professionalReferences);
                if (sucess > 0)
                {
                    return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
                }
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.RecordNotDeleted, CrudResult.Failed);
            }
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
        }

        public async Task<ApiResponseModel<CrudResult>> UpdateProfessionalReference(ProfessionalReferenceRequestDto request)
        {
            if (request == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidRequest, CrudResult.Failed);
            }
            if (request.Id <= 0)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.BadRequest, ErrorMessage.InvalidId, CrudResult.Failed);
            }
            var professionalReference = _mapper.Map<ProfessionalReference>(request);
            professionalReference.ModifiedBy = UserEmailId;
            var professional = await _unitOfWork.ProfessionalReferenceRepository.GetByIdAsync(request.Id);
            if (professional == null)
            {
                return new ApiResponseModel<CrudResult>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, CrudResult.Failed);
            }
            await _unitOfWork.ProfessionalReferenceRepository.UpdateAsync(professionalReference);
            return new ApiResponseModel<CrudResult>((int)HttpStatusCode.OK, SuccessMessage.Success, CrudResult.Success);
        }

        public async Task<ApiResponseModel<ProfessionalReferenceResponseDto>> GetProfessionalReference(long id)
        {
            var professionalReference = await _unitOfWork.ProfessionalReferenceRepository.GetByIdAsync(id);
            if (professionalReference != null)
            {
                var professionalReferenceDto = _mapper.Map<ProfessionalReferenceResponseDto>(professionalReference);
                return new ApiResponseModel<ProfessionalReferenceResponseDto>((int)HttpStatusCode.OK, SuccessMessage.Success, professionalReferenceDto);
            }
            else
            {
                return new ApiResponseModel<ProfessionalReferenceResponseDto>((int)HttpStatusCode.NotFound, ErrorMessage.NotFoundMessage, null);
            }
        }
    }
}