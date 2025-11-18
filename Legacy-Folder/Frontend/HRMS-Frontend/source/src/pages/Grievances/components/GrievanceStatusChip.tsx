import {
  GRIEVANCE_LEVEL_LABEL,
  GRIEVANCE_STATUS_LABEL,
  GrievanceLevel,
  GrievanceStatus,
} from "@/utils/constants";
import { Chip, ChipProps } from "@mui/material";
import { SvgIconComponent } from "@mui/icons-material";
import MovingIcon from "@mui/icons-material/Moving";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
// import AutorenewIcon from "@mui/icons-material/Autorenew";
// import TaskAltIcon from "@mui/icons-material/TaskAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AdjustIcon from "@mui/icons-material/Adjust";

type StatusMeta = {
  label: string;
  color: ChipProps["color"];
  Icon: SvgIconComponent;
};

function getGrievanceStatusMeta(
  status: GrievanceStatus,
  level?: GrievanceLevel
): StatusMeta {
  const baseLabel = GRIEVANCE_STATUS_LABEL[status];

  switch (status) {
    case GrievanceStatus.Open:
      return { label: baseLabel, color: "info", Icon: AdjustIcon };

    case GrievanceStatus.Resolved:
      return { label: baseLabel, color: "success", Icon: CheckCircleIcon };

    // case GrievanceStatus.InProgress:
      // return { label: baseLabel, color: "info", Icon: AutorenewIcon };

    // case GrievanceStatus.Closed:
      // return { label: baseLabel, color: "secondary", Icon: TaskAltIcon };

    case GrievanceStatus.Escalated: {
      const levelLabel = level ? GRIEVANCE_LEVEL_LABEL[level] : undefined;
      const color = level === GrievanceLevel.L3 ? "error" : "warning";

      return {
        label: levelLabel ? `${baseLabel} to ${levelLabel}` : baseLabel,
        color,
        Icon: MovingIcon,
      };
    }

    default:
      return { label: "Unknown", color: "default", Icon: HelpOutlineIcon };
  }
}

type GrievanceStatusChipProps = Readonly<{
  status: GrievanceStatus;
  level?: GrievanceLevel;
  chipProps?: Partial<ChipProps>;
}>;

const GrievanceStatusChip = (props: GrievanceStatusChipProps) => {
  const { status, level, chipProps } = props;

  const { label, color, Icon } = getGrievanceStatusMeta(status, level);

  return (
    <Chip
      icon={<Icon aria-hidden="true" />}
      label={label}
      color={color}
      variant="filled"
      aria-label={`Status: ${label}`}
      tabIndex={-1}
      sx={{
        borderRadius: "1rem",
        fontWeight: 500,
        "& .MuiChip-label": {
          whiteSpace: "nowrap",
          maxWidth: 160,
          textOverflow: "ellipsis",
          overflow: "hidden",
        },
      }}
      {...chipProps}
    />
  );
};

export default GrievanceStatusChip;
