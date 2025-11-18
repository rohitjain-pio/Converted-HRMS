import { BranchLocation, EmployeeStatus } from "@/utils/constants";

export type EmployeeType = {
  slNo: number;
  id: number;
  employeeCode: string;
  employeeName: string;
  fatherName: string;
  gender: number;
  dob: string;
  email: string;
  address: string;
  permanantAddress: string | null;
  cityName: string;
  stateName: string;
  pinCode: string;
  emergencyContactNo: string;
  joiningDate: string;
  confirmationDate: string;
  jobType: number;
  branch: BranchLocation;
  pfNumber: string;
  pfDate: string;
  bankName: string;
  accountNo: string;
  panNumber: string;
  esiNo: string;
  departmentName: string;
  designation: string;
  reportingManagerName: string;
  passportNo: string;
  passportExpiry: string;
  alternatePhone: string;
  phone: string;
  personalEmail: string;
  bloodGroup: string;
  maritalStatus: number;
  uanNo: string;
  hasPF: boolean;
  hasESI: boolean;
  adharNumber: number;
  employeeStatus: EmployeeStatus;
};

export interface EmployeeSearchFilter {
  employeeCode?: string;
  // employeeName?: string;
  departmentId: number;
  designationId: number;
  roleId: number;
  employeeStatus: number;
  employmentStatus: number;
  branchId: number;
  dojFrom: string | null;
  dojTo: string | null;
  countryId: number;
}

export interface GetEmployeeListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: {
    employeeList: EmployeeType[];
    totalRecords: number;
  };
}
export interface GetEmployeeListArgs {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: EmployeeSearchFilter;
}

export interface DepartmentType {
  id: number;
  name: string;
}

export interface GetDepartmentListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: DepartmentType[];
}

export type ExportEmployeesDataArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: EmployeeSearchFilter;
};

export type ImportEmployeesDataResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export interface TeamType {
  id: number;
  name: string;
}

export interface GetTeamListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: TeamType[];
}
