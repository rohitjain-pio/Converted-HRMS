import { alpha, Box, Stack, SvgIcon, Typography } from "@mui/material";
import CalendarSunnyIcon from "@/components/icons/CalendarSunnyIcon";
import { FEATURE_FLAGS, permissionValue } from "@/utils/constants";
// import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { useNavigate } from "react-router-dom";
import { hasPermission } from "@/utils/hasPermission";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

const ApplyNew = () => {
  const navigate = useNavigate();
  const enableLeave = useFeatureFlag(FEATURE_FLAGS.enableLeave);
  const enableAttendance = useFeatureFlag(FEATURE_FLAGS.enableAttendance);

  const sections = [
    ...(hasPermission(permissionValue.LEAVE_DETAILS.READ) && enableLeave
      ? [
          {
            label: "Leave",
            Icon: () => <CalendarSunnyIcon sx={{ fontSize: "4rem" }} />,
            to: "/leave/apply-leave",
          },
        ]
      : []),

    // ...(hasPermission(permissionValue.LEAVE_APPROVAL.READ)
    //   ? [
    //       {
    //         label: "Leave Approval",
    //         Icon: () => (
    //           <EventAvailableOutlinedIcon sx={{ fontSize: "3.63rem" }} />
    //         ),
    //         to: "/leave/leave-approval",
    //       },
    //     ]
    //   : []),

    ...(hasPermission(permissionValue.Attendance_Details.READ) &&
    enableAttendance
      ? [
          {
            label: "Attendance",
            Icon: () => (
              <CalendarMonthOutlinedIcon sx={{ fontSize: "3.63rem" }} />
            ),
            to: "/attendance/my-attendance",
          },
        ]
      : []),
  ];

  return (
    <Stack direction="row" sx={{ height: "100%", overflow: "hidden" }}>
      {sections.map(({ label, Icon, to }) => (
        <Box
          key={label}
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            onClick={() => navigate(to)}
            sx={(theme) => ({
              bgcolor: alpha(theme.palette.common.white, 0.5),
              borderRadius: "10px",
              border: "1px solid #e3e7eb",
              p: 1,
              mb: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              "&:hover": {
                bgcolor: "#F6F9FC",
              },
            })}
          >
            <SvgIcon component={Icon} sx={{ fontSize: "4rem" }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
};

export default ApplyNew;
