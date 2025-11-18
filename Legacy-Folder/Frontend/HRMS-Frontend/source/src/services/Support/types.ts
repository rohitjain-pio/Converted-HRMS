import { BUG_TYPE, FEEDBACK_STATUS } from "@/utils/constants";

export type FeedbackType = {
  id: number;
  employeeName: string;
  employeeEmail: string;
  ticketStatus: FEEDBACK_STATUS;
  feedbackType: BUG_TYPE;
  subject: string;
  description: string;
  createdOn: string;
  modifiedOn:string
};
export type EmployeeFeedbackType = {
  id: number;

  ticketStatus: FEEDBACK_STATUS;
  feedbackType: BUG_TYPE;
  subject: string;
  description: string;
  createdOn: string;
};

export type FeedbackTypeFilter = {
  createdOnFrom: string | null;
  createdOnTo: string | null;
  ticketStatus: number;
  feedbackType: number;
  employeeCodes?: string;
  searchQuery: string;
};
export type AddFeedBackResponse = {
  statusCode: number;
  message: string;
  result: number;
};
export type AddFeedBackRequestArgs = {
  employeeId: number;
  feedbackType: number;
  subject: string;
  description: string;
  attachment: File |string| null;
};

export type FeedbackTicket = {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  ticketStatus: FEEDBACK_STATUS;
  feedbackType: BUG_TYPE;
  subject: string;
  description: string;
  adminComment: string | null;
  attachmentPath: string | null;
  fileOriginalName: string | null;
  createdOn: string;
};
export type EmployeeFeedbackTypeFilter = {
  createdOnFrom: string | null;
  createdOnTo: string | null;
  ticketStatus: number;
  feedbackType: number;
  searchQuery: string;
};
export type GetFeedbackById = {
  statusCode: number;
  message: string;
  result: FeedbackTicket;
};
export type GetFeedBackList = {
  statusCode: number;
  message: string;
  result: {
    totalRecords: number;
    feedbackList: FeedbackType[];
  };
};
export type GetFeedbackListArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: FeedbackTypeFilter;
};
export type GetEmployeeFeedbackListArgs = {
  sortColumnName: string;
  sortDirection: string;
  startIndex: number;
  pageSize: number;
  filters: EmployeeFeedbackTypeFilter;
};
export type GetEmployeeFeedBackList = {
  statusCode: number;
  message: string;
  result: {
    totalRecords: number;
    feedbackList: EmployeeFeedbackType[];
  };
};
export type UpdateStatusFeedBackArgs = {
  id:number,
  ticketStatus:number
  AdminComment:string
};
export type UpdateStatusFeedBack = {
  statusCode: number;
  message: string;
  result: number;
};