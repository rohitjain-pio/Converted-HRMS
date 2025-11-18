import { permissionValue } from "@/utils/constants";
import PersonalDetails from "./PersonalDetails";
import OfficialDetails from "./OfficialDetails";
import EmploymentDetails from "@/pages/EmploymentDetails";
import EducationDetails from "@/pages/EducationDetails";
import Nominee from "@/pages/Nominee";
import Certificates from "@/pages/Certificates";
import EmployeeITAssets from "@/pages/ITAssets/EmployeeITAssets/EmployeeITAssets";
import ExitDetails from "@/pages/Resignation/ExitDetails";
import { PersonalDetailsType } from "@/services/User";

interface EmployeeTabsProps {
  employeeId: string|null;
  personalDetails:  PersonalDetailsType | undefined;
  fetchUserProfile: (params?: void | undefined) => Promise<void>;
  canInitiateNewResignation: boolean;
  fetchResignationActiveStatus: (params?: void | undefined) => Promise<void>;
  enableITAsset: boolean;
  enableExitEmployee: boolean;
  displayExitDetailsTab: boolean;
  loadingResignationStatus: boolean;
}

const EmployeeTabs = ({
  employeeId,
  personalDetails,
  fetchUserProfile,
  canInitiateNewResignation,
  fetchResignationActiveStatus,
  enableITAsset,
  enableExitEmployee,
  displayExitDetailsTab,
  loadingResignationStatus,
}: EmployeeTabsProps) => {
  const {
    PERSONAL_DETAILS,
    OFFICIAL_DETAILS,
    EMPLOYMENT_DETAILS,
    EDUCATIONAL_DETAILS,
    NOMINEE_DETAILS,
    CERTIFICATION_DETAILS,
    ASSET_DETAILS
  } = permissionValue;

  const tabs = [
    {
      label: "Personal Details",
      content: (
        <PersonalDetails
          data={personalDetails}
          fetchUserProfile={fetchUserProfile}
          canInitiateNewResignation={canInitiateNewResignation}
        />
      ),
      path: `personal-details${employeeId ? `?employeeId=${employeeId}` : ""}`,
      canRead: PERSONAL_DETAILS.READ,
    },
    {
      label: "Official Details",
      content: <OfficialDetails />,
      path: `official-details${employeeId ? `?employeeId=${employeeId}` : ""}`,
      canRead: OFFICIAL_DETAILS.READ,
    },
    {
      label: "Employment Details",
      content: <EmploymentDetails />,
      path: `employment-details${employeeId ? `?employeeId=${employeeId}` : ""}`,
      canRead: EMPLOYMENT_DETAILS.READ,
    },
    {
      label: "Education Details",
      content: <EducationDetails />,
      path: `education-details${employeeId ? `?employeeId=${employeeId}` : ""}`,
      canRead: EDUCATIONAL_DETAILS.READ,
    },
    {
      label: "Nominee Details",
      content: <Nominee />,
      path: `nominee-details${employeeId ? `?employeeId=${employeeId}` : ""}`,
      canRead: NOMINEE_DETAILS.READ,
    },
    {
      label: "Certificate Details",
      content: <Certificates />,
      path: `certificate-details${employeeId ? `?employeeId=${employeeId}` : ""}`,
      canRead: CERTIFICATION_DETAILS.READ,
    },
    ...(enableITAsset
      ? [
          {
            label: "IT Assets",
            content: <EmployeeITAssets />,
            path: `IT-Assets${employeeId ? `?employeeId=${employeeId}` : ""}`,
            canRead: ASSET_DETAILS.VIEW,
          },
        ]
      : []),
    ...(enableExitEmployee && displayExitDetailsTab && !loadingResignationStatus
      ? [
          {
            label: "Exit Details",
            content: (
              <ExitDetails
                fetchResignationActiveStatus={fetchResignationActiveStatus}
              />
            ),
            path: `exit-details${employeeId ? `?employeeId=${employeeId}` : ""}`,
          },
        ]
      : []),
  ];

  return tabs;
};

export default EmployeeTabs;

