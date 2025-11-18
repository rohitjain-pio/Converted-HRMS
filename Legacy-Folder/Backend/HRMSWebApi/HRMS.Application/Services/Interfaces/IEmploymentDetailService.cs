using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.UserProfile;

namespace HRMS.Application.Services.Interfaces
{
    public interface IEmploymentDetailService
    {
        Task<ApiResponseModel<CrudResult>> AddEmploymentDetail(AddEmploymentDetailRequestDto request);
        Task<ApiResponseModel<string?>> GetEmployeeTimedoctorUserId(string email);
        Task<ApiResponseModel<CrudResult>> UpdateEmploymentDetail(EmploymentRequestDto request);
        Task<ApiResponseModel<CrudResult>> ArchiveUnarchiveEmploymentDetails(EmployeeArchiveRequestDto employeeArchiveRequestDto);
        Task<ApiResponseModel<EmploymentResponseDto>> GetEmplyementDetailById(long id);
        Task<ApiResponseModel<CrudResult>> UploadCurrentEmployerDocument(CurrentEmployerDocRequestDto employerDocRequestDto);
        Task<ApiResponseModel<IEnumerable<EmployerDocumentTypeResponseDto>>> GetEmployerDocumentTypeList(int documentFor);
        Task<ApiResponseModel<CrudResult>> DeleteEmploymentDetails(long id);
        Task<ApiResponseModel<CrudResult>> ArchiveUnarchiveDepartment(DepartmentArchiveRequestDto departmentArchiveRequestDto);
        Task<ApiResponseModel<CrudResult>> ArchiveUnarchiveTeam(ArchiveTeamRequestDto teamArchiveRequestDto);
        Task<ApiResponseModel<CrudResult>> ArchiveUnarchiveDesignation(DesignationArchiveRequestDto designationArchiveRequest);
        Task<ApiResponseModel<EmploymentDetailsForDwnTwn>> GetEmplyementDetails(string email);
    }
}