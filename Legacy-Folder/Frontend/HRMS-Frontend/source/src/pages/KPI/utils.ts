import { GoalRating } from "@/services/KPI";
import { isQuarter, Quarter } from "@/utils/constants";

export const quarterFieldMap = {
  [Quarter.Q1]: { ratingKey: "q1_Rating", noteKey: "q1_Note" },
  [Quarter.Q2]: { ratingKey: "q2_Rating", noteKey: "q2_Note" },
  [Quarter.Q3]: { ratingKey: "q3_Rating", noteKey: "q3_Note" },
  [Quarter.Q4]: { ratingKey: "q4_Rating", noteKey: "q4_Note" },
} as const;

export function parseQuarterCsv(rawStr: string | null | undefined) {
  if (!rawStr || typeof rawStr !== "string") {
    return [];
  }
  const tokens = rawStr
    .split(",")
    .map((x) => x.trim())
    .filter((x) => isQuarter(x));

  return tokens;
}
export function canEmployeeSubmitRatings(goalRatingData: GoalRating[]) {
  for (const goal of goalRatingData) {
    const allowedQuarters = parseQuarterCsv(goal.allowedQuarter);
    for (const quarter of allowedQuarters) {
      const { ratingKey } = quarterFieldMap[quarter];
      const value = goal[ratingKey];
      if (value === null) {
        return false;
      }
    }
  }

  return true;
}
export function canManagerSubmitRatings(goalRatingData: GoalRating[]) {
  for (const goal of goalRatingData) {
    if (goal.managerRating === null) {
      return false;
    }
  }

  return true;
}

export const getManagerRatingSummary = (ratings: GoalRating[]) => {
  const filledRatings = ratings.filter((r) => r.managerRating !== null);
  const total = ratings.length;
  const filled = filledRatings.length;

  if (filled === total && total > 0) {
    const average =
      filledRatings.reduce((sum, r) => sum + (r.managerRating ?? 0), 0) / total;
    const percentage = (average / 10) * 100;

    return percentage.toFixed(2);
  } else {
    return null;
  }
};
