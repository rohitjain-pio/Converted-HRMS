import { httpInstance } from "@/api/httpInstance";
import {
  AddTeamArgs,
  AddTeamResponse,
  GetTeamByIdResponse,
  GetTeamListArgs,
  GetTeamListResponse,
  UpdateTeamArgs,
  UpdateTeamStatusArgs,
  UpdateTeamStatusResponse,
} from "@/services/Team/types";

const baseRoute = "/UserProfile";

export const getTeamList = async (payload: GetTeamListArgs) => {
  return httpInstance.post(
    `${baseRoute}/GetTeams`,
    payload
  ) as Promise<GetTeamListResponse>;
};

export const addTeam = async (args: AddTeamArgs) => {
  return httpInstance.post(`${baseRoute}/AddTeam`, args) as Promise<
    AddTeamResponse
  >;
};

export const getTeamById = async (id: number) => {
  return httpInstance.get(`${baseRoute}/GetTeamById?id=${id}`) as Promise<
    GetTeamByIdResponse
  >;
};

export const updateTeam = async (args: UpdateTeamArgs) => {
  return httpInstance.post(`${baseRoute}/UpdateTeam`, args) as Promise<
    AddTeamResponse
  >;
};

export const updateTeamStatus = async (args: UpdateTeamStatusArgs) => {
  return httpInstance.delete(`${baseRoute}/ArchiveUnarchiveTeam`, {data: args}) as Promise<
    UpdateTeamStatusResponse
  >;
};
