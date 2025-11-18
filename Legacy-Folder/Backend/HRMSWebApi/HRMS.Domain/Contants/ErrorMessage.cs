namespace HRMS.Domain.Contants
{
        public static class ErrorMessage
        {
                public const string Internal = "something went wrong";
                public const string AttendanceUpdateFailed = "Failed to update attendance configuration.";
                public const string NotFoundMessage = "No record found";
                public const string AppConfigurationMessage = "Can not get appsettings value";
                public const string TransactionNotCommit = "Transaction not commit";
                public const string TransactionNotExecute = "Transaction not execute";
                public const string ErrorInSavingFile = "Error in saving file to location";
                public const string FileTypeIsNotSupport = "File type is not supported";
                public const string AuthenticationFailed = "Authentication is failed";
                public const string UserNotExist = "User doesn't exist";
                public const string InvalidRequest = "Invalid request";
                public const string RoleRequired = "Role is required";
                public const string RoleNotExist = "Role is not available";
                public const string CompanyPolicyNotExist = "Company Policy is not available";
                public const string RecordNotAdded = "Record not added";
                public const string GroupNameAlreadyExists = "Group name already exists.";
                public const string InvalidId = "Invalid ID. The ID must be greater than zero.";
                public const string FileNotSaved = "File Saving is failed";
                public const string InvalidImageType = "Supported image file types are jpg, jpeg, png";
                public const string InvalidImageMaxSize = "File size must be less than 1MB";
                public const string ErrorInSavingFileDb = "Error in saving file in database";
                public const string NoFile = "No file was provided";
                public const string NoEmployeeFound = "No employees found";
                public const string NoGroupFound = "No Group found";
                public const string ErrorFileDeletion = "Error in file deletion";
                public const string ErrorInFileNameUpdate = "Getting error in updating/removing file name in database";
                public const string ProfileImageNotExists = "User profile image not exists";
                public const string UpdateFailed = "Update user profile image is failed";
                public const string InvalidPolicyMaxSize = "File size must be less than 5MB";
                public const string InvalidDocumentType = "Supported document types are doc, docx, pdf";
                public const string InvalidDocMaxSize = "Document size must be less than 5 MB";
                public const string ErrorUploadFileOnBlob = "Error in uploading user document on blob storage";
                public const string ErrorDocumentInfoInDB = "Error in saving document information in database";
                public const string EmployeeIdZero = "Employee Id is zero";
                public const string ExceedPercentage = "Total percentage for this employee exceeds 100%";
                public const string FileNotExist = "File does not Exist";
                public const string FileNameRequired = "File name is required";
                public const string RecordNotUpdated = "Record not updated";
                public const string InvalidEmployeeId = "Invalid Employee Id found.";
                public const string GroupIdNotExists = "Group ID does not exists. Please verify the ID and try again.";
                public const string ModelStateInValid = "Model state is invalid";
                public const string NomineeNotExists = "Nominee does not exists. Please verify the ID and try again.";
                public const string CompanyPolicyDocRequered = "Company policy document is required";
                public const string RecordNotDeleted = "Record not deleted";
                public const string EmployerNotExist = "Employer is not Exist";
                public const string EmailAlreadyExists = "Personal email already exists.";
                public const string InvalidAddressId = "Invalid Address ID. The ID must be greater than zero.";
                public const string UpdateRequesEmpty = "Update request is empty";
                public const string NoBirthdayExists = "No birthdays for this week";
                public const string NoWorkAnniversaryExists = "No work anniversary for this week";
                public const string NoPublishedCompanyPolicies = "No published company policies found matching the specified filters.";
                public const string InvalidFilter = "Please provide either 'Days' or both 'From' and 'To' filters, but not both.";
                public const string InvalidCount = "Please add minimum 2 or maximum 3 professional references.";
                public const string QualificationExist = "Entered Qualification is already exist.";
                public const string AtLeastOneYearGapRequired = "Atleast 1 year gap is required between StartYear and EndYear for HSC/SSC";
                public const string AtLeastTwoYearGapRequired = "Atleast 2 year gap is required between StartYear and EndYear for Diploma/Graduation/Post Graduation";
                public const string InvalidQualification = "Invalid Qualification";
                public const string InvalidRefreshToken = "Refresh token is invalid";
                public const string RefreshTokenExpired = "Refresh token has expired";
                public const string InvalidAccessToken = "Invalid access token";
                public const string InvalidEmployerDocumentTypeCount = "DocumentFor value must be 1 or 2";
                public const string EmployerDocumentTypeNotFound = "EmployerDocumentType not found";
                public const string DocumentExpiryNotEntered = "DocumentExpiry is required";
                public const string DocumentAlreadyUploaded = "Document already uploaded";
                public const string DraftSurvey = "A survey in the draft state can only be edited";
                public const string SurveyInDraft = "Survey should be in draft to publish";
                public const string DocumentAlreadyExists = "The document has been already uploaded.";
                public const string AlreadySubmittedSurvey = "You have already submitted this survey";
                public const string SurveyNotFound = "Survey does not exist in the system.";
                public const string RequestNull = "Request is empty";
                public const string CertificateNameAlreadyExists = "Certificate name already exists.";
                public const string MaxProfessionalReference = "A maximum of 3 professional references are allowed";
                public const string NullProfessionalReference = "Please enter the professional references";
                public const string DesignationIsNotSaved = "Designation is not saved";
                public const string NoRecordInserted = "No records are inserted";
                public const string RecordInserted = "Success.";
                public const string RecordInsertionFailed = "Import Failed.";
                public const string InvalideExcelFile = "Invalid file format. Please upload an Excel file only.";
                public const string DepartmentIsNotSaved = "Department is not saved";
                public const string EmailAlreadyExist = "Employee email already existing, please use unique email.";
                public const string EmpCodeAlreadyExist = "Employee Code already existing, please use unique Employee code.";
                public const string ActiveDesignationExist = "Designation already exists please use unique designation name";
                public const string DeactivatedDesignationExist = "Designation is deactivated please activate the designation";
                public const string ActiveTeamExist = "Team already exists please use unique team name";
                public const string DeactivatedTeamExist = "Team is deactivated please activate the team";
                public const string ActiveDepartmentExist = "Department already exists please use unique department name";
                public const string DeactivatedDepartmentExist = "Department is deactivated please activate the department";
                public const string ValidTeam = "Please enter valid team name";
                public const string ValidDepartment = "Please enter valid Department name";
                public const string ValidDesignation = "Please enter valid Designation name";
                public const string TeamIsNotSaved = "Team is not saved";
                public const string ResignationExist = "Resignation is already updated";
                public const string ResignationNotFound = "Resignation not found";
                public const string ResignationAlreadyRevoked = "Resignation is already revoked";
                public const string ResignationRevokeFailed = "The request has already been rejected by the admin.";
                public const string ResignationEarlyReleaseFailed = "Failed to request early release";


                public const string ResignationRejected = "Resignation is Rejected";

                public const string ResignationNotExist = "Your Resignation does not exist ";
                public const string JobNotFound = "Job not found";
                public const string TimeDoctorUserIdRequiredForAttendanceMethod = "Time Doctor user ID is required to update the attendance method";
                public const string TimeDoctorUserIdNotFound = "Time Doctor user id not found";
                public const string TimeDoctorUserIdAlreadyExists = "Time Doctor user ID already exists";
                public const string InvalidLeaveApplication = "Invalid leave application request";
                public const string LeaveBalanceZero = "Leave balance is Zero";
                public const string InsufficientLeaveBalance = "Insufficient leave balance";
                public const string LeaveApplicatiionFailed = "Leave application failed";
                public const string isManualAttendanceNotAllowed = "You do not have permission to mark manual attendance.";
                public const string AddingFutureDate = "Cannot add attendance for a future date.";
                public const string InvalidDocumentContainerType = "Invalid document type";
                public const string TimeDoctorUserIdInvalidForEmail = "Time Doctor user ID is not valid for this user";
                public const string AlreadyActive = "Another template of this type is already active. Please disable it first.";
                public const string JoiningDateOrGender = "Joining Date is not present";

                public const string FailedToGenerateAttendanceReport = "Failed to generate excel for Attendance report";

                public const string FailedToParseTimeSheetSummaryResponse = "Failed to parse timesheet summary API response";
                public const string EmailIsRequired = "Email is required";

                public const string LeaveNotFound = "Leave Not Found";
                public const string CheckCondition = "Please Check the Condition of Asset";
                public const string CheckStatus = "Please Check the Status of Asset";
                public const string AlreadyAllocated = "This Asset is Already Allocated";
                public const string DuplicateLeaveApplication = "Leave already applied for these dates.";
                public const string TypeNotExist = "Grievance type not Exist";
                public const string RecordNotExist = "Record Not Exist";
                public const string AlreadySubmit = "Already Submitted Plan";
                public const string CannotUpdate = "Cannot Update Submitted plan";
                public const string AlreadyAssigned = "Already Assigned";
                public const string FailedToSubmitGrievance = "Failed to submit grievance.";
                public const string ErrorToSubmitGrievance = "An error occurred while submitting the grievance.";
                public const string GrievanceNotFound = "Grievance not found";
                public const string GrievanceAccessFailed = "You are not authorized to update this grievance";
                public const string UnAuthorized = "Access denied. You do not have the required permission";
                public const string GrievanceMaxLevel = "Grievance is already at the maximum level";
                public const string ErrorToSubmitGrievanceRemarks = "An error occurred while submitting the grievance remarks.";
                public const string GrievanceTypeNotFound = "Grievance type not found";
                public const string InvalidGrievanceId = "Invalid grievance ID";
                public const string GrievanceCouldNotAdded = "Grievance could not be added";

                public const string AlreadyReviewed = "Already Reviewed";
                public const string FailedToGenerateGrievanceReport = "Failed To Generate Grievance Report";
                public const string NameIsRequired = "Grievance name is required";

                public const string AllocationError = "To mark asset as 'InInventory', first deallocate it from the application.";
                public const string InvalidSwapApplication = "Invalid swap holiday application.";
                public const string DuplicateSwapApplication = "A swap holiday application already exists for the specified date.";
                public const string SwapLimitExceeded = "You have already reached the maximum of 2 swap holidays for this year.";
                public const string SwapApplicationFailed = "Failed to apply swap holiday.";
                public const string CompOffAlreadyExist = "Comp Off already exist for this date.";
                public const string CompOffApplicationFailed = "Comp off aplication is failed";
                public const string ErrorInProcessingRequest = "An error occurred while processing your request.";
                public const string InvalidUserGuideId = "Invalid UserGuide Id.";
                public const string UserGuideNotFound = "User Guide Not Found";

                public const string AlreadyExist = "Already Exist";
                                 public const string InvalidExcelFileMaxSize = "File too large. Please upload a file smaller than 5 MB.";
       public const string FeedbackNotFound = "Feedback not found";
    }
}


