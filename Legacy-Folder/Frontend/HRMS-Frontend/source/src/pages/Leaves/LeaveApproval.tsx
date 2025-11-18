import { Box ,Paper,Tab,Tabs} from "@mui/material";
import { useState, SyntheticEvent } from "react";
import LeaveManagerTable from "@/pages/Leaves/components/LeaveManagerTable/index";
import LeaveCompOffPage from "@/pages/Leaves/components/LeaveCompOffTable/index";
import BreadCrumbs from "@/components/@extended/Router";
import PageHeader from "@/components/PageHeader/PageHeader";
type TabPanelProps = Readonly<{
  children?: React.ReactNode;
  index: number;
  value: number;
}>;

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </Box>
  );
}
const LeaveApproval = () => {

  const [tab, setTab] = useState(1);

  const handleTabChange = (_: SyntheticEvent, next: number) => {
    setTab(next);
  };

  return (
    <>
     <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader variant="h2" hideBorder={true} title="Leave Approval" />
     <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="scrollable"
                allowScrollButtonsMobile
                aria-label="Apporve Leave Tabs"
              >
                <Tab
                  value={1}
                  label="Leave Requests"
                  aria-controls="panel-leave"
                />
                <Tab
                  value={2}
                  label="Comp-Off & Swaps"
                  aria-controls="panel-comp"
                />
              </Tabs>
            </Box>

            <CustomTabPanel index={1} value={tab}>
              <LeaveManagerTable />
            </CustomTabPanel>

            <CustomTabPanel index={2} value={tab}>
              <LeaveCompOffPage />
            </CustomTabPanel>
          
    </Paper>
    </>
  );
};

export default LeaveApproval;
