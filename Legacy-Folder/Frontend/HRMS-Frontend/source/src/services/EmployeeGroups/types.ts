export interface EmployeeGroupType {
  id: number;
  groupName: string;
}

export interface GetEmployeeGroupApiResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: EmployeeGroupType[];
}
