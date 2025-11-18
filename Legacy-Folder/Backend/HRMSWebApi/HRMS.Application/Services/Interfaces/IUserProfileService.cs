using HRMS.Domain.Enums;
using HRMS.Models;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.OfficialDetails;
using HRMS.Models.Models.UserProfile;
using Microsoft.AspNetCore.Http;

namespace HRMS.Application.Services.Interfaces
{
    public interface IUserProfileService
    {
        Task<ApiResponseModel<PersonalDetailsResponseDto>> GetPersonalDetailsById(long id);
        Task<ApiResponseModel<List<CountryResponseDto>>> GetCountryList();
        Task<ApiResponseModel<List<StateResponseDto>>> GetStateListByCountryId(long id);
        Task<ApiResponseModel<IEnumerable<GovtDocumentResponseDto>>> GovtDocumentList(int idProofFor);
        Task<ApiResponseModel<CrudResult>> UploadUserProfileImage(UploadFileRequest request);
        Task<ApiResponseModel<CrudResult>> AddPersonalDetail(PersonalDetailsRequestDto personalDetailsRequestDto);
        Task<ApiResponseModel<CrudResult>> RemoveUserProfileImage(long id);
        Task<ApiResponseModel<CrudResult>> UpdateProfilePicture(UploadFileRequest request);
        Task<ApiResponseModel<List<CityResponseDto>>> GetCityListByStateId(long id);
        Task<ApiResponseModel<List<UserDocumentResponseDto>>> GetUserDocumentListAsync(long employeeId);
        Task<ApiResponseModel<UserDocumentResponseDto>> GetUserDocumentById(long id);
        Task<ApiResponseModel<CrudResult>> UploadUserDocument(UserDocumentRequestDto userDocumentRequestDto);
        Task<ApiResponseModel<CrudResult>> UpdateUploadUserDocument(UserDocumentRequestDto userDocumentRequestDto);        
        Task<ApiResponseModel<byte[]?>> DownloadUserDocument(string employerDocumentContainer, string filename);        
        Task<ApiResponseModel<IEnumerable<QualificationResponseDto>>> GetQualificationList();
        Task<ApiResponseModel<IEnumerable<RelationshipResponseDto>>> GetRelationshipList();
        Task<ApiResponseModel<IEnumerable<DepartmentResponseDto>>> GetDepartmentList();
        Task<ApiResponseModel<IEnumerable<TeamResponseDto>>> GetTeamList();
        Task<ApiResponseModel<CrudResult>> UpdatePersonalDetail(PersonalDetailsRequestDto personalDetailsRequestDto);
        Task<ApiResponseModel<EmployeeListSearchResponseDto>> GetEmployees(SearchRequestDto<EmployeeSearchRequestDto> employeeSearchRequestDto);
        Task<ApiResponseModel<IEnumerable<ReportingManagerResponseDto>>> GetReportingManagerList(string? name, int? RoleId);
        Task<ApiResponseModel<List<UniversityResponseDto>>> GetUniversitiesList();
        Task<ApiResponseModel<CrudResult>> AddDepartment(DepartmentRequestDto request);
        Task<ApiResponseModel<CrudResult>> AddTeam(TeamRequestDto request);
        Task<ApiResponseModel<CrudResult>> UpdateTeam(TeamRequestDto request);
        Task<ApiResponseModel<CrudResult>> DeleteTeam(long id);
        Task<ApiResponseModel<CrudResult>> EditDepartment(DepartmentRequestDto request);
        Task<ApiResponseModel<CrudResult>> DeleteDepartment(long id);
        Task<ApiResponseModel<CrudResult>> UpdateOfficialDetails(OfficialDetailsRequestDto request);
        Task<ApiResponseModel<OfficialDetailsResponseDto>> GetOfficialDetailsById(long id);
        Task<ApiResponseModel<CrudResult>> ImportExcelForEmployes(IFormFile employeesExcel, bool importConfirmed);
    
        Task<byte[]> ExportEmployeeListToExcel(SearchRequestDto<EmployeeSearchRequestDto> employeeSearchRequestDto);
        Task<ApiResponseModel<IEnumerable<DesignationResponseDto>>> GetDesignationList();
        Task<ApiResponseModel<DepartmentResponseDto>> GetDepartmentById(long id);
        Task<ApiResponseModel<TeamResponseDto>> GetTeamById(long id);
        Task<ApiResponseModel<DepartmentSearchResponseDto>> GetDepartment(SearchRequestDto<DepartmentSearchRequestDto> departmentSearchRequestDto);
        Task<ApiResponseModel<TeamSearchResponseDto>> GetTeams(SearchRequestDto<TeamSearchRequestDto> departmentSearchRequestDto);
        Task<ApiResponseModel<CrudResult>> AddDesignation(DesignationRequestDto request);
        Task<ApiResponseModel<DesignationResponseDto>> GetDesignationById(long id);
        Task<ApiResponseModel<CrudResult>> EditDesignation(DesignationRequestDto request);
        Task<ApiResponseModel<DesignationSearchResponseDto>> GetDesignation(SearchRequestDto<DesignationSearchRequestDto> designationSearchRequestDto);
        Task<ApiResponseModel<string>> GetLatestEmpCode();
        Task<ApiResponseModel<PersonalProfileDetailsResponseDto>> GetPersonalProfileByIdAsync(long id);
        Task<ApiResponseModel<string?>> GetUserDocumentSasUrl(BlobDocumentContainerType containerType, string filename);

    }
}
