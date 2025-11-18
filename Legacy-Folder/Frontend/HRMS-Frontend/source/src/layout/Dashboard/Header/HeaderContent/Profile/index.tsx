/* eslint-disable @typescript-eslint/no-explicit-any */
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";

// material-ui
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import CardContent from "@mui/material/CardContent";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

// project import
import { Transitions } from "@/components/@extended/Transitions";
import { MainCardContainer } from "@/components/MainCard";
import ProfileTab from "@/layout/Dashboard/Header/HeaderContent/Profile/ProfileTab";
import { useUserStore } from "@/store";
import ProfilePicture from "@/pages/Profile/components/ProfilePicture";
import { useProfileStore } from "@/store/useProfileStore";
import useAsync from "@/hooks/useAsync";
import {
  getUserProfileSummary,
  GetUserProfileSummaryResponse,
} from "@/services/User";
import methods from "@/utils";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import { getFullName } from "@/utils/getFullName";
import { Divider, useMediaQuery } from "@mui/material";
import { truncate } from "@/utils/helpers";
const { PERSONAL_DETAILS } = permissionValue;

// assets
// import avatar1 from 'assets/images/users/avatar-1.png';

// tab panel wrapper
function TabPanel({ children, value, index, ...other }: any) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

// ==============================|| HEADER CONTENT - PROFILE ||============================== //

export default function Profile() {
  const theme: any = useTheme();

  const { userData } = useUserStore();
  const { profileData, setProfileData } = useProfileStore();
  const { userName, profileImageUrl } = profileData;
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const anchorRef: any = useRef(null);
  const [open, setOpen] = useState(false);
  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: any) => {
    if (anchorRef.current && anchorRef.current?.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  function truncateUserName(userName: string) {
    return truncate(userName, { maxLength: 35 });
  }

  const iconBackColorOpen = "grey.100";

  const { execute: fetchUserProfileSummary } =
    useAsync<GetUserProfileSummaryResponse>({
      requestFn: async (): Promise<GetUserProfileSummaryResponse> => {
        return await getUserProfileSummary(userData.userId);
      },
      onSuccess: (response) => {
        const { firstName, lastName, fileName } = response.data.result;
        setProfileData({
          userName: getFullName({
            firstName: firstName?.trim(),
            lastName: lastName?.trim(),
          }),
          profileImageUrl: fileName || "",
        });
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  useEffect(() => {
    if (userData?.userId && hasPermission(PERSONAL_DETAILS.READ)) {
      fetchUserProfileSummary();
    }
  }, [userData]);

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <ButtonBase
        sx={{
          padding: "2px 6px",
          bgcolor: open ? iconBackColorOpen : "transparent",
          borderRadius: 1,
          "&:hover": { bgcolor: "secondary.lighter" },
          "&:focus-visible": {
            outline: `2px solid ${theme.palette.secondary.dark}`,
            outlineOffset: 2,
          },
          display: "flex",
          gap: 1.5,
        }}
        aria-label="open profile"
        ref={anchorRef}
        aria-controls={open ? "profile-grow" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        disableRipple
      >
        <ProfilePicture
          userName={userName}
          profileImageUrl={profileImageUrl}
          size={38}
        />
        {isMdUp && (
          <Stack direction="column" alignItems="flex-start">
            <Typography
              variant="subtitle1"
              sx={{ textTransform: "capitalize", color: "#273a50" }}
            >
              {truncateUserName(userName)}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {userData.roleName}
            </Typography>
          </Stack>
        )}
      </ButtonBase>
      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 9],
              },
            },
          ],
        }}
      >
        {({ TransitionProps }) => (
          <Transitions
            type="grow"
            position="top-right"
            in={open}
            {...TransitionProps}
          >
            <Paper
              sx={{
                boxShadow: theme?.customShadows?.z1,
                width: 290,
                minWidth: 240,
                maxWidth: { xs: 250, md: 290 },
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCardContainer elevation={0} border={false} content={false}>
                  <CardContent sx={{ px: 2.5, pt: 2, pb: 2 }}>
                    <Grid
                      container
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Grid item>
                        <Stack
                          direction="row"
                          spacing={1.25}
                          alignItems="center"
                        >
                          <Stack>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                textTransform: "capitalize",
                                color: "#273a50",
                              }}
                            >
                              {truncateUserName(userName)}
                            </Typography>
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                            >
                              {userData.roleName}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                  <Divider sx={{ color: "#f0f0f0", borderBottomWidth: 2 }} />
                  <TabPanel value={0} index={0}>
                    <ProfileTab handleClose={handleToggle} />
                  </TabPanel>
                </MainCardContainer>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number,
  index: PropTypes.number,
  other: PropTypes.any,
};
