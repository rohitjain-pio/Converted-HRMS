export interface AddressType {
  id: number;
  countryId: number;
  stateId: number;
  cityId: number;
  countryName?: string;
  stateName?: string;
  cityName?: string;
  line1: string;
  line2?: string;
  addressType: number;
  pincode: string | null;
}

export interface PersonalDetailsType {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  fatherName: string;
  profilePictureLocation?: string;
  fileName?: string;
  fileOriginalName?: string;
  bloodGroup: string | null;
  gender: number;
  dob: string | null;
  phone?: string;
  alternatePhone?: string;
  emergencyContactPerson?: string;
  emergencyContactNo?: string;
  personalEmail: string;
  nationality: string;
  maritalStatus: number;
  interest?: string;
  email?: string;
  address: AddressType;
  permanentAddress: AddressType;
}

export interface OfficialDetailsType {
  id: number;
  panNumber: string;
  aadharNumber: number;
  pfNumber: string;
  uanNumber: number;
  passportNumber: string;
  bankAccountNumber: number;
  bankName: string;
  ifscCode: string;
}
export interface EmployeeDetailsType {
  id: number;
  employeeId: number;
  employeeCode: string;
  email: string;
  joiningDate: string | null; // assuming it's in ISO format (YYYY-MM-DD)
  teamId: number;
  teamName: string;
  designation: string;
  designationId: number;
  linkedInUrl: string;
  branchId: number;
  departmentId: number;
  departmentName: string;
  backgroundVerificationstatus: number | null;
  criminalVerification: boolean | null;
  jobType: number | null;
  branch: string;
  employmentStatus: number | null;
  totalExperienceYear: number;
  totalExperienceMonth: number;
  relevantExperienceYear: number;
  relevantExperienceMonth: number;
  confirmationDate: string | null;
  extendedConfirmationDate: string | null;
  isProbExtended: boolean;
  probExtendedWeeks: number;
  isConfirmed: boolean;
  probationMonths: number;
  reportingManagerName: string;
  reportingManagerId: number | null;
  roleId: number;
  isReportingManager: boolean;
  employeeStatus: number | null;
  timeDoctorUserId: string | null;
}

export interface GetUserProfileResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: PersonalDetailsType;
}

export interface UpdateUserProfileResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: number;
}

export interface CountryType {
  id: number;
  countryName: string;
}

export interface GetCountryListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: CountryType[];
}

export interface StateType {
  id: number;
  stateName: string;
}

export interface GetStateListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: StateType[];
}

export interface CityType {
  id: number;
  cityName: string;
}

export interface GetCityListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: CityType[];
}

export interface DesignationType {
  id: number;
  name: string;
}

export interface GetDesignationListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: DesignationType[];
}

export interface AddOrUpdateEmploymentDetailResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: number;
}

export interface GetEmploymentDetailByIdResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: EmployeeDetailsType;
}

export interface RoleIDType {
  id: number;
  name: string;
}

export interface GetRoleIDListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: RoleIDType[];
}

export type AddEmploymentDetailArgs = {
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeCode: string;
  email: string;
  joiningDate: string;
  branchId: number;
  teamId: number;
  designationId: number;
  reportingManagerId: number;
  employmentStatus: number;
  backgroundVerificationstatus: number;
  criminalVerification: boolean;
  departmentId: number;
  totalExperienceYear: number;
  totalExperienceMonth: number;
  relevantExperienceYear: number;
  relevantExperienceMonth: number;
  jobType: number;
  probationMonths: number;
  timeDoctorUserId: string | null;
};

export type UpdateEmploymentDetailArgs = {
  id: number;
  employeeId: number;
  employeeCode: string;
  email: string;
  joiningDate: string | null;
  branchId: number;
  teamId: number;
  designationId: number;
  reportingManagerId: number | null;
  employmentStatus: number | null;
  linkedInUrl: string;
  backgroundVerificationstatus: number | null;
  criminalVerification: boolean | null;
  departmentId: number;
  totalExperienceYear: number;
  totalExperienceMonth: number;
  relevantExperienceYear: number;
  relevantExperienceMonth: number;
  jobType: number | null;
  isProbExtended: boolean;
  probExtendedWeeks?: number;
  probationMonths: number;
  confirmationDate: string | null;
  extendedConfirmationDate?: string | null;
  roleId: number;
  isReportingManager: boolean;
  employeeStatus: number | null;
  timeDoctorUserId: string | null;
};

export type RemoveProfilePictureResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type UploadProfilePictureResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type GetLatestEmployeeCodeResponse = {
  statusCode: number;
  message: string;
  result: string;
};

export type UserProfileSummary = {
  id: number;
  firstName: string;
  lastName: string;
  fileName: string;
};

export type GetUserProfileSummaryResponse = {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: UserProfileSummary;
};
export type DownloadDocumentApiResponse = {
  statusCode: number;
  message: string;
  result: string;
};
