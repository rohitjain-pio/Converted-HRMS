export type DesignationType = {
  id: number;
  name: string;
  status: boolean;
};

export interface DesignationSearchFilter {
  designation?: string;
  status?: boolean | null;
}

export interface GetDesignationListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: {
    designationList: DesignationType[];
    totalRecords: number;
    totalPercentage: number;
  };
}
export interface GetDesignationListArgs {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: DesignationSearchFilter;
}

export type AddDesignationArgs = {
  designation: string;
};

export interface AddDesignationResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: boolean;
}

export interface GetDesignationByIdResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: DesignationType;
}

export type UpdateDesignationArgs = {
  id: number;
  designation: string;
};

export type UpdateDesignationStatusArgs = {
  id: number;
  isArchived: boolean;
};

export type UpdateDesignationStatusResponse = {
  statusCode: number;
  message: string;
  result: null;
};
