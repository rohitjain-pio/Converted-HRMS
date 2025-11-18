import { GrievanceLevel, GrievanceStatus } from "@/utils/constants";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import GrievanceStatusChip from "@/pages/Grievances/components/GrievanceStatusChip";
import Chip from "@mui/material/Chip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupIcon from "@mui/icons-material/Group";
import Divider from "@mui/material/Divider";
import { formatUtcToLocal } from "@/utils/date";

type Props = Readonly<{
  title: string;
  ticketNumber: string;
  createdAt: string;
  status: GrievanceStatus;
  level: GrievanceLevel;
  currentLevelOwnerNames: string[];
  grievanceTypeName: string;
  resolvedDate?: string | null;
}>;

const TicketHeader = (props: Props) => {
  const {
    title,
    ticketNumber,
    createdAt,
    status,
    currentLevelOwnerNames,
    grievanceTypeName,
    resolvedDate,
    level,
  } = props;

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        py: { xs: 1, sm: 1.25 },
      }}
    >
      <Stack spacing={1} useFlexGap px={{ xs: 1.5, sm: 2 }}>
        {/* Row 1: Title, number, status, type */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          gap={1}
        >
          <Stack
            direction="row"
            spacing={1.25}
            useFlexGap
            alignItems="baseline"
            flexWrap="wrap"
          >
            <Typography variant="h3">{title}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              #{ticketNumber}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={0.75}
            useFlexGap
            alignItems="center"
            flexWrap="wrap"
          >
            <GrievanceStatusChip
              status={status}
              level={level}
              chipProps={{ size: "small" }}
            />
            <Chip
              label={grievanceTypeName}
              size="small"
              variant="outlined"
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
            />
          </Stack>
        </Stack>

        {/* Row 2: Created, Resolved, Managed by (Current Owners) */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={{ xs: 1, sm: 2 }}
          useFlexGap
          flexWrap="wrap"
          divider={<Divider orientation="vertical" flexItem />}
        >
          <Stack direction="row" spacing={0.75} useFlexGap alignItems="center">
            <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Created {formatUtcToLocal(createdAt)}
            </Typography>
          </Stack>

          {resolvedDate && (
            <Stack
              direction="row"
              spacing={0.75}
              useFlexGap
              alignItems="center"
            >
              <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary">
                Resolved {formatUtcToLocal(resolvedDate)}
              </Typography>
            </Stack>
          )}

          {!!currentLevelOwnerNames.length && (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              // sx={{ ml: { xs: 0, sm: "auto" } }}
              flexWrap="wrap"
              useFlexGap
            >
              <GroupIcon
                sx={{ fontSize: 16, color: "text.secondary", mr: 0.25 }}
              />
              {currentLevelOwnerNames.map((name) => (
                <Chip
                  key={name}
                  label={name}
                  size="small"
                  variant="outlined"
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
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};

export default TicketHeader;
