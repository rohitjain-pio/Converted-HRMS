import { GoalRating } from "@/services/KPI";
import { Quarter } from "@/utils/constants";

export type CellPosition= {
    rowIndex: number;
    columnIndex: number;
} | null

export type AssignedCell= {
    goalId?: number;
    target: string;
    isDisabled?: boolean;
    employeeId?: number;
    quarter?: string;
    plainId?: number | null;
    employeeName?: string;
    employeeEmail?: string;
} | null

export type SelectedCell= {
    quarter: Quarter;
    goalId: number;
    goalTitle: string;
    rating: number | null;
    note: string | null;
    isEditable: boolean;
} | null

export type RatingResponse={
      employeeCode: string;
      employeeId: number;
      employeeName: string;
      isReviewed:boolean|null
      email: string;
      joiningDate: string;
      planId: number;
      reviewDate:string|null;
      lastReviewDate: string | null;
      nextAppraisal: string | null;
      ratings: GoalRating[];
    }