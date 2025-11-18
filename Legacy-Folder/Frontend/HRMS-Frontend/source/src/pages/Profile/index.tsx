import { Paper } from "@mui/material";
import { useEffect, useState } from "react";
import useAsync from "@/hooks/useAsync";
import {
  GetUserProfileResponse,
  // OfficialDetailsType,
  PersonalDetailsType,
  getUserProfile,
} from "@/services/User";
import methods from "@/utils";
import { useUserStore } from "@/store";
import TabPanel from "@/components/TabPanel";
import { hasPermission } from "@/utils/hasPermission";
import {
  FEATURE_FLAGS,
  permissionValue,
  ResignationStatus,
  ResignationStatusCode,
} from "@/utils/constants";
import BreadCrumbs from "@/components/@extended/Router";
import { useSearchParams } from "react-router-dom";
import { useProfileStore } from "@/store/useProfileStore";
import { getFullName } from "@/utils/getFullName";
import {
  getResignationActiveStatus,
  ResignationActiveStatusResponse,
} from "@/services/EmployeeExit";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import EmployeeTabs from "./components/EmployeeTabs";

const Profile = () => {
  const { PERSONAL_DETAILS } = permissionValue;
  const { userData } = useUserStore();
  const { setProfileData } = useProfileStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const [personalDetails, setPersonalDetails] = useState<
    PersonalDetailsType | undefined
  >(undefined);
  const [resignationStatusData, setResignationStatusData] = useState<{
    resignationId: number;
    resignationStatus: ResignationStatusCode;
  } | null>(null);

  const { execute: fetchUserProfile, isLoading } =
    useAsync<GetUserProfileResponse>({
      requestFn: async (): Promise<GetUserProfileResponse> => {
        return await getUserProfile(employeeId ? employeeId : userData.userId);
      },
      onSuccess: ({ data }) => {
        setPersonalDetails(data.result);
        if (!employeeId) {
          const { firstName, lastName, fileName } = data.result;
          setProfileData({
            userName: getFullName({ firstName, lastName }),
            profileImageUrl: fileName || "",
          });
        }
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: false,
    });

  const {
    execute: fetchResignationActiveStatus,
    isLoading: loadingResignationStatus,
  } = useAsync<ResignationActiveStatusResponse>({
    requestFn: async (): Promise<ResignationActiveStatusResponse> => {
      return await getResignationActiveStatus(
        Number(employeeId ? employeeId : userData.userId)
      );
    },
    onSuccess: ({ data }) => {
      setResignationStatusData(data.result);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    if (userData?.userId && hasPermission(PERSONAL_DETAILS.READ)) {
      fetchUserProfile();
      fetchResignationActiveStatus();
    }
  }, [userData, employeeId]);

  const canInitiateNewResignation =
    resignationStatusData === null
      ? true
      : (
          [
            ResignationStatus.cancelled,
            ResignationStatus.revoked,
          ] as ResignationStatusCode[]
        ).includes(resignationStatusData.resignationStatus);

  const displayExitDetailsTab = resignationStatusData !== null;

  const enableExitEmployee = useFeatureFlag(FEATURE_FLAGS.enableExitEmployee);
  const enableITAsset = useFeatureFlag(FEATURE_FLAGS.enableITAsset);

  if (isLoading || loadingResignationStatus) {
    return <p>Loading...</p>;
  }

  const tabs = EmployeeTabs({
    employeeId,
    personalDetails,
    fetchUserProfile,
    canInitiateNewResignation,
    fetchResignationActiveStatus,
    enableITAsset,
    enableExitEmployee,
    displayExitDetailsTab,
    loadingResignationStatus,
  });

  return (
    <>
      <BreadCrumbs />
      <Paper>
        <TabPanel
          tabs={tabs.filter(({ canRead }) =>
            canRead ? hasPermission(canRead) : true
          )}
        />
      </Paper>
    </>
  );
};

export default Profile;
