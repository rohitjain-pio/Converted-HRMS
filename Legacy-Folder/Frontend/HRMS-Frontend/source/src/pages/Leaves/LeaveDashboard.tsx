import { Box, Paper, Tab, Tabs } from "@mui/material";
import PageHeader from "@/components/PageHeader/PageHeader";
import LeaveTypeCardGrid from "@/pages/Leaves/components/LeaveTypeCardGrid";
import BreadCrumbs from "@/components/@extended/Router";
import LeaveHistoryTable from "@/pages/Leaves/components/LeaveHistoryTable/index";
import { SyntheticEvent, useState } from "react";
import CompAndSwapTable from "@/pages/Leaves/components/CompAndSwapTable/index";
import { ApplyCompOffDialog } from "@/pages/Leaves/components/ApplyCompOffDialog";
import { LeaveSwapDialog } from "@/pages/Leaves/components/LeaveSwapDialog";
import useAsync from "@/hooks/useAsync";
import {
  AdjustedLeave,
  GetAdjustedLeavesResponse,
  getAdjustedLeavesByEmployee,
} from "@/services/EmployeeLeave";
import methods from "@/utils";
import { useUserStore } from "@/store";

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

const LeaveDashboard = () => {
  const [tab, setTab] = useState(1);
  const { userData } = useUserStore();
  const [selectedOption, setSelectedOption] = useState<
    "compOff" | "leaveSwap" | null
  >(null);
  const [compAndSwapData, setCompAndSwapData] = useState<AdjustedLeave[]>([]);
  const handleDialogClose = () => {
    setSelectedOption(null);
  };
  const handleOnSuccess = () => {
    setSelectedOption(null);
    fetchData();
  };
  const handleTabChange = (_: SyntheticEvent, next: number) => {
    setTab(next);
  };
  const { execute: fetchData } = useAsync<GetAdjustedLeavesResponse>({
    requestFn: async (): Promise<GetAdjustedLeavesResponse> => {
      return await getAdjustedLeavesByEmployee(Number(userData.userId));
    },
    onSuccess: ({ data }) => {
      setCompAndSwapData(data?.result ?? []);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });
  return (
    <>
      <BreadCrumbs />
      <Paper>
        <PageHeader
          variant="h3"
          title="Apply Leave"
        />
        <Box padding="20px">
          <LeaveTypeCardGrid />
          <PageHeader
            variant="h4"
            sx={{ pt: "30px", pb: 2 }}
            title="Leave History"
            containerStyles={{ paddingX: 0 }}
            hideBorder
          />
          <Box>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={tab}
                onChange={handleTabChange}
                variant="scrollable"
                allowScrollButtonsMobile
                aria-label="Apply Leave tabs"
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
              <LeaveHistoryTable />
            </CustomTabPanel>

            <CustomTabPanel index={2} value={tab}>
              <CompAndSwapTable data={compAndSwapData} fetchData={fetchData} setSelectedType={setSelectedOption} />
            </CustomTabPanel>
            {selectedOption == "compOff" && (
              <ApplyCompOffDialog
                onClose={handleDialogClose}
                open={selectedOption == "compOff"}
                onSuccess={handleOnSuccess}
              />
            )}
            {selectedOption == "leaveSwap" && (
              <LeaveSwapDialog
                onClose={handleDialogClose}
                open={selectedOption == "leaveSwap"}
                onSuccess={handleOnSuccess}
              />
            )}
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default LeaveDashboard;
