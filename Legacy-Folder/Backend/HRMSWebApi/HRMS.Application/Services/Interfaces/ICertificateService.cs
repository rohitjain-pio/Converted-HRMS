using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;

namespace HRMS.Application.Services.Interfaces
{
    public interface ICertificateService
    {
        Task<ApiResponseModel<CrudResult>> ArchiveUnarchiveUserCertificate(EmployeeArchiveRequestDto employeeArchiveRequestDto);
        Task<ApiResponseModel<CrudResult>> UploadEmployeeCertificate(UserCertificateRequestDto userCertificateRequestDto);
        Task<ApiResponseModel<UserCertificateSearchResponseDto>> GetEmployeeCerificateList(SearchRequestDto<UserCertificateSearchRequestDto> requestDto);
        Task<ApiResponseModel<UserCertificateResponseDto>> GetUserCertificateById(long id);
        Task<ApiResponseModel<byte[]?>> DownloadCertificateDocument(string containerName, string filename);
        Task<ApiResponseModel<CrudResult>> UpdateUploadEmployeeCertificate(UserCertificateRequestDto userCertificateRequestDto);
    }
}