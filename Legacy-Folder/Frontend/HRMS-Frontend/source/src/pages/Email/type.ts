import { EmailTemplateName, NotificationTemplateSerachFilter } from "@/services/Notification/type";

export interface FilterFormProps {
  onSearch: (filters:NotificationTemplateSerachFilter) => void;
  templateTypeList:EmailTemplateName[]
}
