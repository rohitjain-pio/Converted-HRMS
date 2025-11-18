using HRMS.Domain.Entities;
using HRMS.Models;
using HRMS.Models.Models.Downtown;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.OfficialDetails;
using HRMS.Models.Models.UserProfile;

namespace HRMS.Infrastructure.Interface
{
    public interface IUserProfileRepository : IGenericRepository<EmployeeData>
    {
        Task<PersonalDetailsResponseDto?> GetPersonalDetailByIdAsync(long id);
        Task<IEnumerable<Country?>> GetCountryListAsync();
        Task<IEnumerable<State?>> GetStateListByCountryIdAsync(long id);
        Task<IEnumerable<DocumentType>> GetDocumentType(int idProofFor);
        Task<int> UpdateUserProfileImage(long userId, string fileName, string originalFileName, string modifiedBy);
        Task<int> AddPersonalDetail(EmployeeData employeeData, Address address, PermanentAddress permanentAddress);
        Task<IEnumerable<City?>> GetCityListByStateIdAsync(long Stateid);
        Task<IEnumerable<UserDocumentResponseDto?>> GetUserDocumentListAsync(long employeeId);
        Task<UserDocumentResponseDto?> GetUserDocumentById(long Id);
        Task<int> UploadUserDocument(UserDocument userDocument);
        Task<int> UpdateUserDocument(UserDocument userDocument);
        Task<bool> ValidateEmployeeIdAsync(long employeeId);
        Task<IEnumerable<Qualification?>> GetQualificationListAsync();
        Task<IEnumerable<Relationship>> GetRelationships();
        Task<IEnumerable<PreviousEmployer?>> GetEmployerDetailIdAsync(long id);
        Task<int> UpdatePersonalDetail(EmployeeData employeeData, Address addressList, PermanentAddress permanentAddress);
        Task<bool> PersonalEmailExistsAsync(string email);
        Task<EmployeeSearchResponseDto> GetEmployerList(SearchRequestDto<EmployeeSearchRequestDto> employeeSearchRequestDto);
        Task<IEnumerable<ReportingManagerResponseDto?>> GetReportingManagerListAsync(string name,int? RoleId);
        Task<IEnumerable<University?>> GetUniversityListAsync();
        Task<DocumentType?> GetGovtDocumentTypeById(long id);
        Task<bool> GetCurrentEmployerDocument(long currentEmployeeId, long employeeDocumentTypeId);
        Task<bool> EmployeeDocumentTypeExistsAsync(UserDocumentRequestDto userDocumentRequestDto);
        Task<IEnumerable<DepartmentResponseDto?>> GetDepartmentList();
        Task<IEnumerable<TeamResponseDto?>> GetTeamList();
        Task<int> AddAsync(Departments department);
        Task<int> AddTeamAsync(Teams teams);
        Task<TeamResponseDto?> GetTeamByIdAsync(long id);
        Task<int> UpdateTeam(Teams teams);
        Task<int> DeleteTeamAsync(Teams teams);
        Task<int> UpdateDepartment(Departments department);
        Task<DepartmentResponseDto?> GetDepartmentById(long id);
        Task<int> DeleteDepartment(Departments departments);
        Task<int> UpdateOfficialDetails(OfficialDetails officialDetails, BankDetails bankDetails);
        Task<OfficialDetailsResponseDto?> GetOfficialDetailsById(long id);
        Task<int> InsertUpdateExcelEmployeesData(List<EmployeeData> employeeDetailsList, List<BankDetails> bankDetailsList, List<Address> addressList, List<PermanentAddress> permanentAddressList, List<EmploymentDetail> employmentDetailsList);
        byte[] GenerateExcelFile(IEnumerable<EmployeeResponseDto> employees);
        Task<IEnumerable<EmployeeCodeResponseDto?>> GetAllEmployeeCodesAsync();
        Task<IEnumerable<DesignationResponseDto?>> GetDesignationList();
        Task<DepartmentSearchResponseDto> GetDepartment(SearchRequestDto<DepartmentSearchRequestDto> requestDto);
        Task<TeamSearchResponseDto> GetTeams(SearchRequestDto<TeamSearchRequestDto> requestDto);
        Task<int> AddDesignation(Designation designation);
        Task<DesignationResponseDto?> GetDesignationById(long id);
        Task<int> UpdateDesignation(Designation designation);
        Task<DesignationSearchResponseDto> GetDesignation(SearchRequestDto<DesignationSearchRequestDto> requestDto);
        Task<string?> GetLatestEmpCode();
        Task<DesignationResponseDto?> GetDesignationByName(string Name);
        Task<DepartmentResponseDto?> GetDepartmentByName(string Name);
        Task<TeamResponseDto?> GetTeamByNameAsync(string Name);
        Task<PersonalProfileDetailsResponseDto?> GetPersonalProfileByIdAsync(long id);
        Task<Domain.Enums.Gender?> GetUserGender(long id);
        Task<DateTime?> GetUserJoiningDate(long id);
        Task<EmployeeListSearchResponseDto> GetEmployeesList(SearchRequestDto<EmployeeSearchRequestDto> employeeSearchRequestDto);
    }
}
