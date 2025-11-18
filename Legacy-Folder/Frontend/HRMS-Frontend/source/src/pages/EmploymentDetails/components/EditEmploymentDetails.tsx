import { Box, Divider, Paper } from "@mui/material";
import PageHeader from "@/components/PageHeader/PageHeader";
import CurrentEmploymentForm from "@/pages/EmploymentDetails/components/CurrentEmploymentForm/index";
import BreadCrumbs from "@/components/@extended/Router";
import { LeaveTable } from "@/pages/EmploymentDetails/components/LeaveTable";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { FEATURE_FLAGS } from "@/utils/constants";

const EditEmploymentDetails = () => {
  const enableLeave = useFeatureFlag(FEATURE_FLAGS.enableLeave);
  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader variant="h3" title={`Edit Employment Details`} />
        <Box
          sx={{ borderTop: "1px solid rgba(0  0  0 / .125)", padding: "16px" }}
        >
          <CurrentEmploymentForm isEditable={true} />
        </Box>
        <Divider />
        {enableLeave && <LeaveTable />}
      </Paper>
    </>
  );
};

export default EditEmploymentDetails;
