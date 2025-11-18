
import React, { useMemo } from "react";
import moment from "moment";
import {
  Box,
  Chip,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { DailyLeaveStatusDto } from "@/services/LeaveManagment";

type CustomMonthDateHeaderProps = {
  label: string;
  date: Date;
  leaveData:  Record<string, DailyLeaveStatusDto[]>
  holidayMap: Record<string, string>;
  isFetchingHoliday: boolean;
};

export const CustomDateHeader: React.FC<CustomMonthDateHeaderProps> = ({
  label,
  date,
  leaveData,
  holidayMap,
  isFetchingHoliday,
}) => { const momentDate = useMemo(() => moment(date), [date]);
    const dateKey = momentDate.format("YYYY-MM-DD");
    const dailyEntries = leaveData[dateKey] || [];

    const holidayName = holidayMap[dateKey];

    const totalApproved = dailyEntries.reduce(
      (sum, entry) => sum + entry.approvedCount,
      0
    );
    const totalPending = dailyEntries.reduce(
      (sum, entry) => sum + entry.pendingCount,
      0
    );

    return (
      <Box
        sx={{
          position: "relative",
          height: "100%",
          width: "100%",
          p: 1,
          boxSizing: "border-box",
        }}
      >
       
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: { xs: 14, sm: 16 },
            color: "primary.main",
            textAlign: "center",
          }}
        >
          {label}
        </Typography>

        {(holidayName || momentDate.day() !== 6 && momentDate.day() !== 0) &&
          !isFetchingHoliday &&
          ((totalPending > 0 || totalApproved > 0)&&!holidayName) && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                maxWidth: "6.6em",
              }}
            >
              {totalApproved > 0 && (
                <Tooltip
                  placement="top"
                  title={
                    <Box
                      sx={{
                        maxHeight: "90px",
                        overflowY: "auto",
                        overflow: "auto",
                        scrollbarWidth: "thin",
                        maxWidth: "240px",
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                        Approved Leaves:
                      </Typography>
                      {dailyEntries
                        .filter((entry) => entry.approvedCount > 0)
                        .map((entry, index) => (
                          <MenuItem key={index} sx={{ fontSize: "12px" }}>
                            {`${index + 1}.`} {entry.employeeName} (
                            {entry.department}) - {entry.leaveName}
                            {entry.approvedCount > 1 &&
                              ` (${entry.approvedCount})`}
                          </MenuItem>
                        ))}
                    </Box>
                  }
                  arrow
                >
                  <Chip
                    icon={<CheckCircleIcon sx={{ color: "white" }} />}
                    label={`${totalApproved} Approved`}
                    size="small"
                    sx={{
                      backgroundColor: "success.main",
                      color: "white",
                      fontSize: "0.7rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  />
                </Tooltip>
              )}
              {totalPending > 0 && (
                <Tooltip
                  placement="bottom"
                  title={
                    <Box
                      sx={{
                        maxHeight: "90px",
                        overflowY: "auto",
                        overflow: "auto",
                        scrollbarWidth: "thin",
                        maxWidth: "240px",
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                        Pending Leaves:
                      </Typography>
                      {dailyEntries
                        .filter((entry) => entry.pendingCount > 0)
                        .map((entry, index) => (
                          <MenuItem
                            key={index}
                            sx={{
                              fontSize: "12px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                              {`${index + 1}.`} {entry.employeeName} (
                              {entry.department}) - {entry.leaveName}
                            </Typography>
                            {entry.pendingCount > 1 &&
                              ` (${entry.pendingCount})`}
                          </MenuItem>
                        ))}
                    </Box>
                  }
                  arrow
                >
                  <Chip
                    icon={<HourglassEmptyIcon sx={{ color: "white" }} />}
                    label={`${totalPending} Pending`}
                    size="small"
                    sx={{
                      backgroundColor: "warning.main",
                      color: "white",
                      fontSize: "0.7rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  />
                </Tooltip>
              )}
            </Box>
          )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            maxWidth: "6.6em",
          }}
        >
          {holidayName && (
            <Tooltip title={`Holiday: ${holidayName}`}>
              <Chip
                label={`Holiday: ${holidayName}`}
                size="small"
                sx={{
                  backgroundColor: "info.main",
                  color: "white",
                  fontSize: "0.7rem",
                }}
              />
            </Tooltip>
          )}
        </Box>
      </Box>
    );
  };

