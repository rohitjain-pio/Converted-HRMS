import { FeedbackTypeFilter } from "@/services/Support/types";

export const DEFAULT_FEEDBACK_TYPE_FILTERS: FeedbackTypeFilter={
    feedbackType:0,
    ticketStatus:0,
    searchQuery:"",
    createdOnFrom:null,
    createdOnTo:null
}