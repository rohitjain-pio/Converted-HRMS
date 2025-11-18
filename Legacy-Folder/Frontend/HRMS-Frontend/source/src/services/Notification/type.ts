import {  EmailTemplateStatus } from "@/utils/constants";
export type getNotifcationArgs = {
  startIndex: number;
  pageSize: number;
  sortColumnName: string;
  sortColumnDirection: string;
  filters: NotificationTemplateSerachFilter;
};
export type EmailTemplate = {
  id: number;
  templateName: string;
  subject: string;
  createdOn:string
  modifiedOn:string|null
  content: string;
  type: number;
  status?: EmailTemplateStatus | null;
  senderName: string;
  senderEmail: string;
  ccEmails: string;
  bccEmails: string;
  toEmail: string;
};
export interface GetNotificationListResponse {
  statusCode: number;
  message: string;
  result: {
    emailTemplates: EmailTemplate[];
    totalRecords: number;
  };
}
export type NotificationTemplateSerachFilter = {
  templateName: string;
  senderName: string;
  senderEmail: string;
  templateType: number | null;
  status:EmailTemplateStatus|null|undefined
};

export type AddorUpdateNotificationTemplateRequest = {
  id: number|null;
  templateName: string;
  subject: string;
  content: string;
  type: number|null;
  senderName: string;
  senderEmail: string;
  ccEmails: string;
  bccEmails?: string;
  toEmail?: string;

};

export type AddorUpdateNotificationTemplateResponse = {
  statusCode: number;
  message: string;
  result:  number; 
};
export type GetNotFicationTemplateById={
   statusCode: number;
  message: string;
  result:  EmailTemplate;
  
}
export type ToggleEmailStatus={
   statusCode: number;
  message: string;
  result:  number;
  
}
export type GetDefaultNotFicationTemplateById={
   statusCode: number;
  message: string;
  result:  EmailTemplate;
}
export type EmailTemplateName={
  id:number,
  name:string
}
export type getTemplateNameList={
  statusCode: number;
  message: string;
  result:  EmailTemplateName[];
}
export type deleteTemplateResponse={
  statusCode: number;
  message: string;
  result:  number;
}