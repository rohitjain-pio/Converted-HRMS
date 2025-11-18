export type EventType = {
  id: number;
  eventName: string;
  employeeGroup: string;
  startDate: string;
  startTime: string;
  endDate: string;
  status: string;
  link1: string;
  link2: string;
  link3: string;
  createdOn: string;
  createdBy: string;
  venue: string;
  bannerFileName: string;
  content: string;
  eventFeedbackSurveyLink: string;
  empGroupId?: string;
  eventCategoryId?: string;
  statusId?: string;
  eventDocument: EventDocumentType[];
};

export type EventDocumentType = {
  id: number;
  originalFileName: string;
  fileName: string;
  eventId: number;
  createdOn: string;
};

export type EventListSearchFilter = {
  eventName: string;
  statusId: number;
  isReset?: boolean;
};

export type EventListItem = {
  id: number;
  eventName: string;
  employeeGroup: string;
  startDate: string;
  endDate: string;
  status: string;
  venue: string;
  bannerFileName: string;
};

export type GetEventListArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: EventListSearchFilter;
};

export type GetEventListResponse = {
  statusCode: number;
  message: string;
  result: {
    eventList: EventListItem[];
    totalRecords: number;
  } | null;
};

export type DeleteEventResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type GetEventCategoryListResponse = {
  statusCode: number;
  message: string;
  result: { id: number; category: string }[];
};

export type GetEventStatusListResponse = {
  statusCode: number;
  message: string;
  result: { id: number; statusValue: string }[];
};
export interface GetEventResponse {
  statusCode: number;
  message: string;
  modelErrors: string[];
  result: EventType;
}

export type CreateEventResponse = {
  statusCode: number;
  message: string;
  result: null;
};

export type DeleteEventDocumentResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type UpdateEventStatusResponse = {
  statusCode: number;
  message: string;
  result: number;
};

export type EventStatusType =
  | "WIP / Pending Approval"
  | "Upcoming"
  | "Completed";
