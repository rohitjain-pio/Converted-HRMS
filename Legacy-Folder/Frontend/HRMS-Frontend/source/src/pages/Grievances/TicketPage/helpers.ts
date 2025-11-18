import { alpha, Theme } from "@mui/material/styles";
import { GrievanceStatus } from "@/utils/constants";

export function getCardTone(
  theme: Theme,
  origin: "requester" | "owner",
  status?: GrievanceStatus,
  toneBy: "origin" | "status" | "none" = "origin"
) {
  const pick = () => {
    if (toneBy === "status" && status) {
      if (status === GrievanceStatus.Resolved) return theme.palette.success;
      if (status === GrievanceStatus.Escalated) return theme.palette.warning;
    }
    if (toneBy === "origin")
      return origin === "requester"
        ? theme.palette.info
        : theme.palette.primary;
    return theme.palette.divider;
  };

  const base = pick() as typeof theme.palette.primary;
  const tint = theme.palette.mode === "dark" ? 0.16 : 0.06;
  const borderTint = theme.palette.mode === "dark" ? 0.48 : 0.2;

  return {
    bgColor:
      toneBy === "none"
        ? theme.palette.background.paper
        : alpha(base.main, tint),
    bgColorOnHover:
      toneBy === "none"
        ? undefined
        : alpha(
            base.main,
            tint + (theme.palette.mode === "dark" ? 0.04 : 0.02)
          ),
    borderColor:
      toneBy === "none" ? theme.palette.divider : alpha(base.main, borderTint),
    railColor: toneBy === "none" ? theme.palette.divider : base.main,
  };
}
