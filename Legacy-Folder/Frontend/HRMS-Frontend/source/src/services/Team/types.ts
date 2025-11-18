export type TeamType = {
  id: number;
  name: string;
  status: boolean;
};

export interface TeamSearchFilter {
  teamName?: string;
  status?: boolean | null;
}

export interface GetTeamListResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: {
    teamList: TeamType[];
    totalRecords: number;
    totalPercentage: number;
  };
}
export interface GetTeamListArgs {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: TeamSearchFilter;
}

export type AddTeamArgs = {
  teamName: string;
};

export interface AddTeamResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: boolean;
}

export interface GetTeamByIdResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: TeamType;
}

export type UpdateTeamArgs = {
  id: number;
  teamName: string;
};

export type UpdateTeamStatusArgs = {
  id: number;
  isArchived: boolean;
};

export type UpdateTeamStatusResponse = {
  statusCode: number;
  message: string;
  result: null;
};
