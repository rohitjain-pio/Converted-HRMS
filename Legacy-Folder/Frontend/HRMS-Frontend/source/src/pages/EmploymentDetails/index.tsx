import { SyntheticEvent, useState } from "react";
import CurrentEmploymentDetails from "@/pages/EmploymentDetails/components/CurrentEmploymentDetails";
import PreviousEmploymentDetails from "@/pages/EmploymentDetails/components/PreviousEmploymentDetails";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import { useSearchParams } from "react-router-dom";
import NotFoundPage from "@/pages/NotFoundPage";
import { useUserStore } from "@/store";

export type EmploymentPanelKey = "currentEmployment" | "previousEmployment";

export type EmploymentPanelProps = {
  expanded: boolean;
  onAccordionToggle: (
    panel: EmploymentPanelKey
  ) => (_: SyntheticEvent, isExpanded: boolean) => void;
};

const EmploymentDetails = () => {
  const { READ } = permissionValue.PREVIOUS_EMPLOYER;
  const { userData } = useUserStore();
  const [ searchParams ] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const { EMPLOYEES } = permissionValue;
  const [expandedPanels, setExpandedPanels] = useState<
    Record<EmploymentPanelKey, boolean>
  >({
    currentEmployment: false,
    previousEmployment: false,
  });

  const handlePanelToggle =
    (panel: EmploymentPanelKey) =>
    (_: SyntheticEvent, newExpanded: boolean) => {
      setExpandedPanels((prev) => ({
        ...prev,
        [panel]: newExpanded,
      }));
    };

  if (employeeId && userData.userId != employeeId && !hasPermission(EMPLOYEES.READ)) {
    return <NotFoundPage />;
  }

  return (
    <>
      <CurrentEmploymentDetails
        expanded={expandedPanels.currentEmployment}
        onAccordionToggle={handlePanelToggle}
      />
      {hasPermission(READ) && (
        <PreviousEmploymentDetails
          expanded={expandedPanels.previousEmployment}
          onAccordionToggle={handlePanelToggle}
        />
      )}
    </>
  );
};

export default EmploymentDetails;
