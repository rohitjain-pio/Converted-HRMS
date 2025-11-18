import { KeyboardArrowDown } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { EmploymentPanelProps } from "..";
import { permissionValue } from "@/utils/constants";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { hasPermission } from "@/utils/hasPermission";
import CurrentEmploymentForm from "@/pages/EmploymentDetails/components/CurrentEmploymentForm/index";

type CurrentEmploymentProps = EmploymentPanelProps;

const CurrentEmploymentDetails = (props: CurrentEmploymentProps) => {
  const { expanded, onAccordionToggle } = props;
 const { EDIT } = permissionValue.EMPLOYMENT_DETAILS;

  const [isEditable, setIsEditable] = useState(false);

  const handleEdit = () => {
    setIsEditable((preVal) => !preVal);
  };

  const makeEditable = false;

  return (
    <>
      <Accordion
        expanded={expanded}
        onChange={onAccordionToggle("currentEmployment")}
        disableGutters
        sx={{ border: "1px solid rgba(0  0  0 / .125)" }}
      >
        <AccordionSummary
          expandIcon={<KeyboardArrowDown />}
          sx={{ backgroundColor: "rgba(0  0  0 / .03)" }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            <Box flexGrow={1}>
              <Typography>Current Employment Details</Typography>
            </Box>
            {makeEditable && expanded && hasPermission(EDIT) ? (
              <Box>
                <Tooltip
                  title={isEditable ? "Cancel" : "Edit current employment"}
                >
                  <IconButton
                    aria-label={
                      isEditable ? "cancel" : "edit current employment"
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit();
                    }}
                    sx={{ width: "24px", height: "24px" }}
                    color={isEditable ? "error" : "primary"}
                  >
                    {isEditable ? <CloseIcon /> : <EditIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            ) : null}
          </Stack>
        </AccordionSummary>
        <AccordionDetails
          sx={{ borderTop: "1px solid rgba(0  0  0 / .125)", padding: "16px" }}
        >
          <CurrentEmploymentForm isEditable={isEditable} />
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default CurrentEmploymentDetails;
