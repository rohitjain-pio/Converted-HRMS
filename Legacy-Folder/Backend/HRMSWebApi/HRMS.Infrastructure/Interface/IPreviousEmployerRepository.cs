using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;

namespace HRMS.Infrastructure.Interface
{
    public interface IPreviousEmployerRepository: IGenericRepository<PreviousEmployer>
    {
        Task<PreviousEmployerSearchResponseDto> GetPreviousEmployerList(SearchRequestDto<PreviousEmployerSearchRequestDto> requestDto);
        Task<bool> GetPreviousEmployerDocument(long previousEmployerId, long employerDocumentTypeId);
        Task<int> UploadPreviousEmployerDocumentAsync(PreviousEmployerDocument PreviousEmployerDocument);
        Task<int> DeletePreviousEmployerDocumentAsync(PreviousEmployerDocument previousEmployerDocument);
        Task<PreviousEmployerDocument?> GetPreviousEmployerDocumentByIdAsync(long id);
    }
}