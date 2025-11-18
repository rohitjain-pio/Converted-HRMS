import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  styled,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import useAsync from "@/hooks/useAsync";
import {
  removeProfilePicture,
  RemoveProfilePictureResponse,
  uploadProfilePicture,
  UploadProfilePictureResponse,
} from "@/services/User";
import methods from "@/utils";
import { toast } from "react-toastify";
import { useUserStore } from "@/store";
import { useSearchParams } from "react-router-dom";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

function getInitials(userName: string) {
  const nameParts = userName.trim().split(" ");
  const initials =
    nameParts.length === 1
      ? nameParts[0].charAt(0)
      : nameParts
          .slice(0, 2)
          .map((part) => part.charAt(0))
          .join("");

  return initials.toUpperCase();
}

function stringToColor(string: string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

function getBase64(img: File, callback: (url: string) => void) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result as string);
  reader.readAsDataURL(img);
}

const StyledAvatar = styled(Avatar)<{ userName: string; size: number }>(
  ({ theme, userName, size }) => ({
    height: size,
    width: size,
    fontSize: size / 2.5,
    backgroundColor: stringToColor(userName),
    color: theme.palette.common.white,
  })
);

const AvatarWrapper = styled(Box)<{ size: number }>(({ size }) => ({
  position: "relative",
  height: size,
  width: size,
  borderRadius: "50%",
  cursor: "pointer",
  overflow: "hidden",
  "&:hover .overlay": {
    opacity: 1,
  },
}));

const AvatarOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  color: theme.palette.common.white,
  opacity: 0,
  transition: "opacity 0.3s ease",
}));

type ProfilePictureProps = {
  userName: string;
  profileImageUrl?: string;
  size: number;
  fetchUserProfile?: (params?: void | undefined) => Promise<void>;
  editable?: boolean;
};

function ProfilePicture(props: ProfilePictureProps) {
  const { userName, profileImageUrl, size, editable, fetchUserProfile } = props;
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setImageUrl(profileImageUrl || null);
  }, [profileImageUrl]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const file = files?.[0] || null;
    if (file) {
      uploadPicture(file);
    }
  };

  const resetInputValue = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileRemove = () => {
    setImageUrl(null);
    resetInputValue();
  };

  const openDialog = () => {
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const { execute: uploadPicture } = useAsync<
    UploadProfilePictureResponse,
    File
  >({
    requestFn: async (file: File): Promise<UploadProfilePictureResponse> => {
      return await uploadProfilePicture(
        employeeId ? employeeId : userData.userId,
        file
      );
    },
    onSuccess: (response, params) => {
      toast.success(response.data.message);
      if (params) {
        getBase64(params, (url) => {
          setImageUrl(url);
        });
        closeDialog();
      }
      fetchUserProfile?.();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: removeCurrentProfilePicture } =
    useAsync<RemoveProfilePictureResponse>({
      requestFn: async (): Promise<RemoveProfilePictureResponse> => {
        return await removeProfilePicture(
          employeeId ? employeeId : userData.userId
        );
      },
      onSuccess: (response) => {
        toast.success(response.data.message);
        handleFileRemove();
        closeDialog();
        fetchUserProfile?.();
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  return (
    <>
      <VisuallyHiddenInput
        ref={fileInputRef}
        type="file"
        accept=".png, .jpg, .jpeg"
        onChange={handleFileChange}
      />
      <AvatarWrapper size={size} onClick={editable ? openDialog : undefined}>
        <StyledAvatar
          userName={userName}
          src={imageUrl ?? undefined}
          size={size}
        >
          {!imageUrl && getInitials(userName)}
        </StyledAvatar>
        {editable && (
          <AvatarOverlay className="overlay">
            <CameraAltIcon />
          </AvatarOverlay>
        )}
      </AvatarWrapper>
      <Dialog
        open={isDialogOpen}
        sx={{
          "& .MuiDialog-paper": { minWidth: "20rem", borderRadius: "0.5rem" },
        }}
      >
        <DialogTitle
          sx={{ fontSize: "1.25rem", fontWeight: 500, textAlign: "center" }}
        >
          Change Profile Photo
        </DialogTitle>
        <DialogActions
          disableSpacing
          sx={{
            flexDirection: "column",
            alignItems: "stretch",
            gap: 0.5,
            pt: 0,
          }}
        >
          <Divider />
          <Button
            variant="text"
            onClick={handleFileClick}
            disableRipple
            sx={{ textTransform: "none", fontWeight: 600, lineHeight: 1.5 }}
          >
            Upload Photo
          </Button>
          {imageUrl && (
            <>
              <Divider />
              <Button
                variant="text"
                onClick={() => removeCurrentProfilePicture()}
                disableRipple
                color="error"
                sx={{ textTransform: "none", fontWeight: 600, lineHeight: 1.5 }}
              >
                Remove Current Photo
              </Button>
            </>
          )}
          <Divider />
          <Button
            variant="text"
            onClick={closeDialog}
            color="secondary"
            disableRipple
            sx={{ textTransform: "none", lineHeight: 1.5 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ProfilePicture;
