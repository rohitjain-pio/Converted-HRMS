export interface OfficialDetailsType {
  employeeId: string;
  panNumber: string;
  pfNumber: string | null;
  adharNumber: string | null;
  esiNo: string | null;
  hasESI: boolean;
  hasPF: boolean;
  uanNo: string | null;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  branchName: string | null;
  passportExpiry: string | null;
  pfDate: string | null;
  passportNo: string | null;
}

export interface GetOfficialDetailByIdResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: OfficialDetailsType | null;
}

export type UpdateOfficialDetailArgs = {
  id: number;
  panNumber: string;
  adharNumber: string;
  pfNumber: string | null;
  uanNo: string | null;
  esiNo: string | null;
  hasESI: boolean;
  hasPF: boolean;
  passportExpiry: string | null;
  passportNo: string | null;
  pfDate: string | null;
  bankDetails: {
    employeeId: number;
    accountNo: string;
    bankName: string;
    ifscCode: string;
    branchName: string;
  };
};

export interface UpdateOfficialDetailResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: number;
}
