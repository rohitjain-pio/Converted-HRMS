using AutoMapper;
using HRMS.Domain.Entities;
using HRMS.Models.Models;
using HRMS.Models.Models.Asset;
using HRMS.Models.Models.Attendance;
using HRMS.Models.Models.CompanyPolicy;
using HRMS.Models.Models.Dashboard;
using HRMS.Models.Models.Downtown;
using HRMS.Models.Models.EmployeeGroup;
using HRMS.Models.Models.Employees;
using HRMS.Models.Models.Event;
using HRMS.Models.Models.Grievance;
using HRMS.Models.Models.KPI;
using HRMS.Models.Models.Leave;
using HRMS.Models.Models.NotificationTemplate;
using HRMS.Models.Models.OfficialDetails;
using HRMS.Models.Models.RolePermission;
using HRMS.Models.Models.Survey;
using HRMS.Models.Models.UserGuide;
using HRMS.Models.Models.UserProfile;

namespace HRMS.Application.Mappings
{
    public class MapProfile : Profile
    {
        public MapProfile()
        {
            CreateMap<CompanyPolicy, CompanyPolicyRequestDto>().ReverseMap();
            CreateMap<AttendanceAudit, AttendanceAuditDto>().ReverseMap();
            CreateMap<Attendance, AttendanceRequestDto>().ReverseMap();
            CreateMap<PolicyStatus, PolicyStatusResponseDto>().ReverseMap();
            CreateMap<CompanyPolicyDocCategory, CompanyPolicyDocCategoryResponseDto>().ReverseMap();
            CreateMap<Group, EmployeeGroupResponseDto>().ReverseMap();
            CreateMap<CompanyPolicy, CompanyPolicyResponseDto>().ReverseMap();
            CreateMap<EmployeeData, PersonalDetailsResponseDto>().ReverseMap();
            CreateMap<Country, CountryResponseDto>().ReverseMap();
            CreateMap<State, StateResponseDto>().ReverseMap();
            CreateMap<DocumentType, GovtDocumentResponseDto>().ReverseMap();
            CreateMap<Address, AddressRequestDto>().ReverseMap();
            CreateMap<PermanentAddress, PermanentAddressDto>().ReverseMap();
            CreateMap<EmployeeData, PersonalDetailsRequestDto>().ReverseMap();
            CreateMap<CompanyPolicyHistory, CompanyPolicyHistoryResponseDto>().ReverseMap();
            CreateMap<City, CityResponseDto>().ReverseMap();
            CreateMap<Group, GroupResponseDto>().ReverseMap();
            CreateMap<UserDocument, UserDocumentRequestDto>().ReverseMap();
            CreateMap<UserNomineeInfo, NomineeRequestDto>().ReverseMap();
            CreateMap<Group, EmployeeGroupRequestDto>().ReverseMap();
            CreateMap<Qualification, QualificationResponseDto>().ReverseMap();
            CreateMap<Relationship, RelationshipResponseDto>().ReverseMap();
            CreateMap<UserQualificationInfo, UserQualificationInfoRequestDto>().ReverseMap();
            CreateMap<EmploymentDetail, EmploymentRequestDto>().ForMember(dest => dest.ReportingManagerId, opt => opt.MapFrom(src => src.ReportingMangerId)).ReverseMap();
            CreateMap<PreviousEmployer, PreviousEmployerRequestDto>().ReverseMap();
            CreateMap<EmployerDocumentType, EmployerDocumentTypeResponseDto>();
            CreateMap<University, UniversityResponseDto>().ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.UniversityName)).ReverseMap();
            CreateMap<Department, DepartmentResponseDto>().ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.title)).ReverseMap();
            CreateMap<Team, TeamResponseDto>().ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.title)).ReverseMap();
            CreateMap<PreviousEmployerDocument, PreviousEmployerDocRequestDto>().ReverseMap();
            CreateMap<RolePermissionRequestDto, Role>().ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.RoleName)).ReverseMap();
            CreateMap<EmployeeData, BirthdayResponseDto>().ForMember(dest => dest.ProfileImagePath, opt => opt.MapFrom(src => src.FileName)).ReverseMap();
            CreateMap<ProfessionalReference, ProfessionalReferenceRequestDto>().ReverseMap();
            CreateMap<Holiday, HolidayDto>().ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.remarks)).ReverseMap();
            CreateMap<UserCertificate, UserCertificateRequestDto>().ReverseMap();
            CreateMap<EmploymentDetail, EmploymentResponseDto>().ReverseMap();
            CreateMap<Event, EventRequestDto>().ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Content)).ReverseMap();
            CreateMap<NotificationTemplate, EmailTemplateAddRequestDto>().ReverseMap();
            CreateMap<NotificationTemplate, EmailTemplateUpdateRequestDto>().ReverseMap();
            CreateMap<NotificationTemplate, EmailTemplateResponseDto>().ReverseMap();
            CreateMap<CurrentEmployerDocument, CurrentEmployerDocRequestDto>().ReverseMap();
            CreateMap<ProfessionalReference, ProfessionalReferenceResponseDto>().ReverseMap();
            CreateMap<Survey, SurveyRequestDto>().ReverseMap();
            CreateMap<PreviousEmployer, PreviousEmployerResponseDto>().ReverseMap();
            CreateMap<SurveyStatus, SurveyStatusResponseDto>().ReverseMap();
            CreateMap<Survey, SurveyResponseDto>().ReverseMap();
            CreateMap<SurveyResponse, SurveyAnswerRequestDto>().ReverseMap();
            CreateMap<EventCategory, EventCategoryResponseDto>().ReverseMap();
            CreateMap<Departments, DepartmentRequestDto>().ReverseMap();
            CreateMap<Teams, TeamRequestDto>().ReverseMap();
            CreateMap<OfficialDetails, OfficialDetailsRequestDto>().ReverseMap();
            CreateMap<BankDetails, BankDetailsRequestDto>().ReverseMap();
            CreateMap<Designation, DesignationRequestDto>().ForMember(dest => dest.Designation, opt => opt.MapFrom(src => src.name)).ReverseMap();

            CreateMap<ImportEmployeesExcelData, BankDetails>()
              .ForMember(dest => dest.CreatedOn, opt => opt.MapFrom(src => DateTime.UtcNow))
              .ForMember(dest => dest.AccountNo, opt => opt.MapFrom(src => src.BankAccountNo))
              .ReverseMap();

            CreateMap<ImportEmployeesExcelData, Address>()
                .ForMember(dest => dest.CreatedOn, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Line1, opt => opt.MapFrom(src => src.CurrentAddress))
                .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
                .ForMember(dest => dest.State, opt => opt.MapFrom(src => src.State))
                .ForMember(dest => dest.Country, opt => opt.MapFrom(src => src.Country))
                .ForMember(dest => dest.Pincode, opt => opt.MapFrom(src => src.Pin))
                .ForMember(dest => dest.AddressType, opt => opt.MapFrom(src => Domain.Enums.AddressType.CurrentAddress)).ReverseMap();

            CreateMap<ImportEmployeesExcelData, PermanentAddress>()
                .ForMember(dest => dest.CreatedOn, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.Pincode, opt => opt.MapFrom(src => src.Pin))
                .ForMember(dest => dest.AddressType, opt => opt.MapFrom(src => Domain.Enums.AddressType.PermanentAddress))
                .ForMember(dest => dest.Line1, opt => opt.MapFrom(src => src.PermanentAddress + ", " + src.City + ", " + src.State + ", " + src.Pin)).ReverseMap();

            CreateMap<ImportEmployeesExcelData, EmploymentDetail>()
                .ForMember(dest => dest.JoiningDate, opt => opt.MapFrom(src => src.DOJ))
                .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department))
                .ForMember(dest => dest.ReportingManagerName, opt => opt.MapFrom(src => src.ReportingManager))
                .ForMember(dest => dest.CreatedOn, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.EmployeeStatus, opt => opt.MapFrom(src => src.EmployeeStatus))
                .ForMember(dest => dest.BranchName, opt => opt.MapFrom(src => src.Branch))
                 .ForMember(dest => dest.JobType, opt => opt.MapFrom(src => src.JobType))

                .ReverseMap();

            CreateMap<ImportEmployeesExcelData, EmployeeData>()
                .ForMember(dest => dest.EmployeeCode, opt => opt.MapFrom(src => src.Code))
                .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.EmployeeName))
                .ForMember(dest => dest.EmergencyContactNo, opt => opt.MapFrom(src => src.EmergencyNo))
                .ForMember(dest => dest.PFNumber, opt => opt.MapFrom(src => src.PFNo))
                .ForMember(dest => dest.UANNo, opt => opt.MapFrom(src => src.UANNumber))
                .ForMember(dest => dest.PANNumber, opt => opt.MapFrom(src => src.PAN))
                .ForMember(dest => dest.AlternatePhone, opt => opt.MapFrom(src => src.Telephone))
                .ForMember(dest => dest.Phone, opt => opt.MapFrom(src => src.MobileNo))
                .ForMember(dest => dest.AdharNumber, opt => opt.MapFrom(src => src.AadhaarNo))
                .ForMember(dest => dest.FatherName, opt => opt.MapFrom(src => src.FathersName))
                .ForMember(dest => dest.CreatedOn, opt => opt.MapFrom(src => DateTime.UtcNow)).ReverseMap();

            CreateMap<EmployeeData, AddEmploymentDetailRequestDto>().ReverseMap();
            CreateMap<EmploymentDetail, AddEmploymentDetailRequestDto>().ForMember(dest => dest.ReportingManagerId, opt => opt.MapFrom(src => src.ReportingMangerId)).ReverseMap();
            CreateMap<AttendanceRowDto, Attendance>().ReverseMap();
            CreateMap<AttendanceRequestDto, Attendance>()
                .ForMember(dest => dest.StartTime, opt => opt.MapFrom(src =>
                    !string.IsNullOrEmpty(src.StartTime) ? TimeSpan.Parse(src.StartTime) : (TimeSpan?)null))
                .ForMember(dest => dest.EndTime, opt => opt.MapFrom(src =>
                    !string.IsNullOrEmpty(src.EndTime) ? TimeSpan.Parse(src.EndTime) : (TimeSpan?)null));


            CreateMap<Resignation, ResignationRequestDto>().ReverseMap();
            CreateMap<ResignationHistory, AcceptEarlyReleaseRequestDto>().ReverseMap();
            CreateMap<ResignationHistory, AcceptResignationRequestDto>().ReverseMap();

            CreateMap<Resignation, ResignationRequestDto>().ReverseMap();
            CreateMap<ResignationHistory, AdminRejectionRequestDto>().ReverseMap();
            CreateMap<HRClearance, HRClearanceResponseDto>().ReverseMap();

            CreateMap<DepartmentClearance, DepartmentClearanceResponseDto>()
           .ForMember(dest => dest.KTUsers,
            opt => opt.MapFrom(src =>
             !string.IsNullOrEmpty(src.KTUsers)
                 ? src.KTUsers.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList()
                 : new List<int>()));

            CreateMap<DepartmentClearanceResponseDto, DepartmentClearance>()
                .ForMember(dest => dest.KTUsers,
                    opt => opt.MapFrom(src =>
                        src.KTUsers != null ? string.Join(",", src.KTUsers) : null));

            CreateMap<DepartmentClearanceRequestDto, DepartmentClearance>()
                .ForMember(dest => dest.KTUsers, opt => opt.MapFrom(src =>
                    src.KTUsers != null ? string.Join(",", src.KTUsers) : null));


            CreateMap<HRClearanceRequestDto, HRClearance>();



            CreateMap<ITClearanceResponseDTO, ITClearance>().ReverseMap();
            CreateMap<ITClearance, ITClearanceRequestDTO>().ReverseMap();
            CreateMap<AccountClearance, AccountClearanceResponseDTO>().ReverseMap();
            CreateMap<AccountClearance, AccountClearanceRequestDto>().ReverseMap();
            CreateMap<AccrualUtilizedLeave, AccrualsUtilizedResponseDto>().ReverseMap();
            CreateMap<EmployeeLeaveRequestDto, EmployeeLeave>().ReverseMap();
            CreateMap<ITAsset, ITAssetRequestDto>().ReverseMap();
            CreateMap<EmployeeAsset, EmployeeAssetCreateDto>().ReverseMap();
            CreateMap<EmployeeAsset, AllocateAssetRequestDto>().ReverseMap();
            CreateMap<ITAssetRequestDto, EmployeeAsset>().ReverseMap();
            CreateMap<EmployeeGrievance, EmployeeGrievanceCreateDto>().ReverseMap();
            

            CreateMap<GoalRequestDto, KPIGoals>().ReverseMap();
            CreateMap<KPIDetails, UpdateEmployeeSelfRatingRequestDto>().ReverseMap();
            CreateMap<KPIDetails, ManagerRatingUpdateRequestDto>().ReverseMap();
            CreateMap<CompOffAndSwapHolidayDetail, SwapHolidayApplyRequestDto>().ReverseMap(); 
            CreateMap<CompOffRequestDto, CompOffAndSwapHolidayDetail>().ReverseMap();
            CreateMap<CompOffAndSwapHolidayDetailRequestDto, CompOffAndSwapHolidayDetail>().ReverseMap();
            CreateMap<AddUserGuide, UserGuide>().ReverseMap();
            CreateMap<UpdateUserGuide, UserGuide>().ReverseMap();
            CreateMap<Feedback, FeedbackRequestDto>().ReverseMap();
            CreateMap<FeedbackResponseDto?, Feedback>().ReverseMap();
        }
    }
}
