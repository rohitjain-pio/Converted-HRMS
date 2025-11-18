
import { DayOption } from "@/pages/Dashboard/components/DayDropdown";


export interface TileData {
  displaySequence: number;
  title: string;
  value: string;
  isShow: boolean;
  background: number;
}


export const employeeSurveyList = [];

export const upcomingEventList = [
  {
    id: 1,
    eventName: "Father Day Celebration",
    eventDate: "2024-10-26",
    eventVenue: "Venue: Microsoft Teams Meet",
    eventImagePath: "",
  },
  {
    id: 2,
    eventName: "Conference",
    eventDate: "2024-10-01",
    eventVenue: "Venue: Delhi",
    eventImagePath: "",
  },
];

export const companyPolicyDocumentList = [
  {
    id: 1,
    docName: "Earned Leave Policy Document",
    docDate: "2024-10-26",
  },
  {
    id: 2,
    docName: "Company Policy Document",
    docDate: "2024-10-26",
  },
];

export const dayOptions: DayOption[] = [
  { value: 7, label: "Past 7 Days" },
  { value: 15, label: "Past 15 Days" },
  { value: 30, label: "Past 30 Days" },
  { value: -1, label: "Custom" },
];
