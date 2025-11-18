import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
const {
  PERSONAL_DETAILS,
  EMPLOYMENT_DETAILS,
  EDUCATIONAL_DETAILS,
  NOMINEE_DETAILS,
  CERTIFICATION_DETAILS,
  OFFICIAL_DETAILS,
} = permissionValue;

export const handleRedirect = (id: number) => {
  const url = `/employment-details/edit/${id}`;
  window.open(url, "_blank");
};

export const handleViewEmployee = (id: number) => {
  if (hasPermission(PERSONAL_DETAILS.READ)) {
    window.open(`/profile/personal-details?employeeId=${id}`, "_blank");
  } else if (hasPermission(EMPLOYMENT_DETAILS.READ)) {
    window.open(`/profile/employment-details?employeeId=${id}`, "_blank");
  } else if (hasPermission(EDUCATIONAL_DETAILS.READ)) {
    window.open(`/profile/education-details?employeeId=${id}`, "_blank");
  } else if (hasPermission(NOMINEE_DETAILS.READ)) {
    window.open(`/profile/nominee-details?employeeId=${id}`, "_blank");
  } else if (hasPermission(CERTIFICATION_DETAILS.READ)) {
    window.open(`/profile/certificate-details?employeeId=${id}`, "_blank");
  } else if (hasPermission(OFFICIAL_DETAILS.READ)) {
    window.open(`/profile/official-details?employeeId=${id}`, "_blank");
  } else {
    window.open(`/unauthorized`, "_blank");
  }
};
