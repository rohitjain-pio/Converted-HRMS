export type DepartmentType = {
  id: number;
  name: string;
  status: boolean;
};

export interface DepartmentSearchFilter {
  department?: string;
  status?: boolean | null;
}

export interface GetDepartmentListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: {
    departmentList: DepartmentType[];
    totalRecords: number;
    totalPercentage: number;
  };
}
export interface GetDepartmentListArgs {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: DepartmentSearchFilter;
}

export type AddDepartmentArgs = {
  department: string;
};

export interface AddDepartmentResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: boolean;
}

export interface GetDepartmentByIdResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: DepartmentType;
}

export type UpdateDepartmentArgs = {
  id: number;
  department: string;
};

export type UpdateDepartmentStatusArgs = {
  id: number;
  isArchived: boolean;
};

export type UpdateDepartmentStatusResponse = {
  statusCode: number;
  message: string;
  result: null;
};
