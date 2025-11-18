import { UserGuideStatus } from "@/utils/constants";

export type GetMenusResponse = {
  statusCode: number;
  message: string;
  result: { id: number; name: string }[];
};

export type GetUserGuideByIdResponse = {
  statusCode: number;
  message: string;
  result: {
    id: number;
    title: string;
    content: string;
    status: UserGuideStatus;
    menuId: number;
    roleId: null;
  } | null;
};

export type AddUserGuidePayload = {
  menuId: number;
  roleId: null;
  content: string;
  status: UserGuideStatus;
  title: string;
};

export type AddUserGuideResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type UpdateUserGuidePayload = {
  id: number;
  roleId: null;
  content: string;
  status: UserGuideStatus;
  title: string;
};

export type UpdateUserGuideResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type GetUserGuideFilter = {
  modifiedOn: string | null;
  createdOn: string | null;
  menuName: string | null;
  status: UserGuideStatus | null;
  title: string | null;
};

export type GetUserGuideListPayload = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: GetUserGuideFilter;
};

export type UserGuide = {
  id: number;
  menuName: string;
  roleId: null;
  content: string;
  status: UserGuideStatus;
  createdOn: string;
  createdBy: string;
  modifiedOn: string | null;
  modifiedBy: string | null;
  title: string;
};

export type GetUserGuideListResponse = {
  statusCode: number;
  message: string;
  result: {
    userGuideList: UserGuide[];
    totalRecords: number;
  };
};

export type DeleteUserGuideResponse = {
  statusCode: number;
  message: string;
  result: number;
};
