using HRMS.Domain.Entities;
using HRMS.Models.Models.UserProfile;
using HRMS.Models;

namespace HRMS.Infrastructure.Interface
{
    public interface INomineeRepository
    {
        Task<int> AddNominee(UserNomineeInfo userNominee);
        Task<bool> ValidatePercentage(UserNomineeInfo userNominee);
        Task<int> UpdateNominee(UserNomineeInfo userNominee);
        Task<bool> ValidateNomineeIdAsync(long? nomineeId);
        Task<NomineeResponseDto?> GetNomineeById(long nomineeId);
        Task<int> DeleteNominee(UserNomineeInfo nominee);
        Task<NomineeSearchResponseDto> GetNomineeList(SearchRequestDto<NomineeSearchRequestDto> requestDto);
        Task<bool> ValidateUpdatePercentage(UserNomineeInfo userNominee);
    }
}
