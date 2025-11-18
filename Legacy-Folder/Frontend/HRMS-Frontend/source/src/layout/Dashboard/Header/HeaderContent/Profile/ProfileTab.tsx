import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store";
import useModulePermissionsStore from "@/store/useModulePermissionsStore";
import {
  FEATURE_FLAGS,
  permissionValue,
  ResignationStatus,
  ResignationStatusCode,
} from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import { useProfileStore } from "@/store/useProfileStore";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { useState } from "react";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import methods from "@/utils";
import useAsync from "@/hooks/useAsync";
import {
  getResignationActiveStatus,
  ResignationActiveStatusResponse,
} from "@/services/EmployeeExit";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

interface ProfileTabProps {
  handleClose: () => void;
}

const ProfileTab = ({ handleClose }: ProfileTabProps) => {
  const navigate = useNavigate();
  const { instance } = useMsal();
  const { setMsalToken, setUserData, isInternalUser, userData } =
    useUserStore();
  const { setModulePermissions } = useModulePermissionsStore();
  const { setProfileData } = useProfileStore();
  const {
    PERSONAL_DETAILS,
    EMPLOYMENT_DETAILS,
    EDUCATIONAL_DETAILS,
    NOMINEE_DETAILS,
    CERTIFICATION_DETAILS,
    OFFICIAL_DETAILS,
  } = permissionValue;

  const [openResignationDialog, setOpenResignationDialog] = useState(false);

  const enableExitEmployee = useFeatureFlag(FEATURE_FLAGS.enableExitEmployee);

  const {
    execute: fetchResignationActiveStatus,
    isLoading: loadingResignationStatus,
  } = useAsync<ResignationActiveStatusResponse>({
    requestFn: async (): Promise<ResignationActiveStatusResponse> => {
      return await getResignationActiveStatus(Number(userData.userId));
    },
    onSuccess: ({ data }) => {
      const resignationStatusData = data.result;

      const canInitiateNewResignation =
        resignationStatusData === null
          ? true
          : (
              [
                ResignationStatus.cancelled,
                ResignationStatus.revoked,
              ] as ResignationStatusCode[]
            ).includes(resignationStatusData.resignationStatus);

      if (canInitiateNewResignation) {
        setOpenResignationDialog(true);
      } else {
        navigate("/profile/exit-details");
        handleClose();
      }
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const logoutUser = async () => {
    await instance.logoutRedirect({
      onRedirectNavigate: () => false,
    });
    setMsalToken({
      idToken: "",
      accessToken: "",
    });

    setUserData(
      {
        authToken: "",
        firstName: "",
        lastName: "",
        roleId: "",
        roleName: "",
        userEmail: "",
        userId: "",
        userName: "",
        menus: [],
      },
      false,
      false
    );

    setProfileData({
      userName: "",
      profileImageUrl: "",
    });

    setModulePermissions([]);

    navigate(isInternalUser ? "/internal-login" : "/");
  };

  const handleProfileClick = () => {
    if (hasPermission(PERSONAL_DETAILS.READ)) {
      navigate("/profile/personal-details");
    } else if (hasPermission(OFFICIAL_DETAILS.READ)) {
      navigate("/profile/official-details");
    } else if (hasPermission(EMPLOYMENT_DETAILS.READ)) {
      navigate("/profile/employment-details");
    } else if (hasPermission(EDUCATIONAL_DETAILS.READ)) {
      navigate("/profile/education-details");
    } else if (hasPermission(NOMINEE_DETAILS.READ)) {
      navigate("/profile/nominee-details");
    } else if (hasPermission(CERTIFICATION_DETAILS.READ)) {
      navigate("/profile/certificate-details");
    } else {
      navigate("/unauthorized");
    }
    handleClose();
  };

  return (
    <>
      <List
        component="nav"
        sx={{ p: 0, "& .MuiListItemIcon-root": { minWidth: 32 } }}
      >
        {(hasPermission(PERSONAL_DETAILS.READ) ||
          hasPermission(EMPLOYMENT_DETAILS.READ) ||
          hasPermission(EDUCATIONAL_DETAILS.READ) ||
          hasPermission(NOMINEE_DETAILS.READ) ||
          hasPermission(CERTIFICATION_DETAILS.READ)) && (
          <ListItemButton onClick={handleProfileClick}>
            <ListItemIcon>
              <PersonIcon sx={{ color: "#1e75bb" }} />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        )}

        {enableExitEmployee && (
          <ListItemButton
            disabled={loadingResignationStatus}
            onClick={() => {
              fetchResignationActiveStatus();
            }}
          >
            <ListItemIcon>
              <ExitToAppIcon sx={{ color: "#1e75bb" }} />
            </ListItemIcon>
            <ListItemText primary="Exit Portal" />
          </ListItemButton>
        )}

        <ListItemButton onClick={() => logoutUser()}>
          <ListItemIcon>
            <LogoutIcon sx={{ color: "#1e75bb" }} />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
      <ConfirmationDialog
        title="Are you sure you want to resign?"
        content="Submitting your resignation will start the exit process, including notice period calculation and final approvals."
        open={openResignationDialog}
        onClose={() => {
          setOpenResignationDialog(false);
        }}
        onConfirm={() => {
          navigate("/resignation-form");
          setOpenResignationDialog(false);
          handleClose();
        }}
        cancelBtnLabel="Cancel"
        confirmBtnLabel="Confirm"
        confirmBtnColor="primary"
      />
    </>
  );
};

export default ProfileTab;
