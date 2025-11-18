using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;

namespace HRMS.Infrastructure.Interface
{
    public interface IEducationalDetailRepository : IGenericRepository<UserQualificationInfo>
    {
        Task<EduDocResponseDto?> GetEducationalDetailsById(long Id);
        Task<int> DeleteEducationalDetails(long id);
        Task<EduDocSearchResponseDto> GetEducationalDocuments(SearchRequestDto<EduDocSearchRequestDto> requestDto);
        Task<bool> CheckEmployeeQualificationExist(long employeeId, long qualificationId, long? Id);
    }
}