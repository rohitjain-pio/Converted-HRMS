using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;

namespace HRMS.Infrastructure.Interface
{
    public interface ICertificateRepository: IGenericRepository<UserCertificate>
    {
        Task<UserCertificateResponseDto?> GetUserCertificateByIdAsync(long id);
        Task<int> ArchiveUnarchiveUserCertificate(EmployeeArchiveRequestDto archiveRequestDto);
        Task<UserCertificateSearchResponseDto?> GetEmployeeCertificates(SearchRequestDto<UserCertificateSearchRequestDto> userCertificateSearchList);
        Task<bool> CertificateNameExistsAsync(UserCertificateRequestDto userCertificateRequestDto);
    }
}