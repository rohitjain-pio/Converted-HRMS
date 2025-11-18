import {
  alpha,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import DataTable from "@/components/DataTable/DataTable";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useState } from "react";

type LeaveRecord = {
  empCode: string;
  empName: string;
  casualLeave: number;
  earnedLeave: number;
  bereavementLeave: number;
  paternityLeave: number;
  maternityLeave: number;
  advanceLeave: number;
  leaveBucket: number;
};

type InvalidRecord = { row: number; reason: string };

export type ValidationResult = {
  validRecordsCount: number;
  duplicateCount: number;
  duplicateRecords: LeaveRecord[];
  invalidCount: number;
  invalidRecords: InvalidRecord[];
};

type Props = {
  data: ValidationResult;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const duplicateTableHeaderCells = [
  {
    label: "S.No",
    accessor: "sNo",
    width: "10%",
    renderColumn: (_: LeaveRecord, index: number) => index + 1,
  },
  {
    label: "Employee Code",
    accessor: "empCode",
    width: "30%",
  },
  {
    label: "Reason ",
    accessor: "reason",
    width: "60%",
  },
];

const invalidTableHeaderCells = [
  { label: "S.No", accessor: "sNo", width: "10%", renderColumn: (_: InvalidRecord, index: number) => index + 1 },
  { label: "Row", accessor: "row", width: "30%" },
  { label: "Reason", accessor: "reason", width: "60%" },
];

const ImportConfirmationDialog = (props: Props) => {
  const [tab, setTab] = useState(0);
  const { data, open, onClose, onConfirm } = props;

  const {
    validRecordsCount,
    duplicateCount,
    duplicateRecords,
    invalidCount,
    invalidRecords,
  } = data;

  return (
    <Dialog open={open} maxWidth="lg" fullWidth>
      <PageHeader title="Confirm Leave Import" variant="h4" />
      <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {duplicateCount || invalidCount ? (
          <Stack gap={2}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                "& .MuiTabs-indicator": {
                  bgcolor: tab === 0 ? "warning.main" : "error.main",
                },
              }}
            >
              <Tab
                label={`Duplicates (${duplicateCount ?? 0})`}

                sx={(theme) => ({
                  "&:hover": {
                    bgcolor: alpha(theme.palette.warning.light, 0.2),
                    color: "warning.dark",
                  },
                  "&.Mui-selected": {
                    color: "warning.dark",
                  },
                })}
              />
              <Tab
                label={`Invalid (${invalidCount})`}
                sx={(theme) => ({
                  "&:hover": {
                    bgcolor: alpha(theme.palette.error.light, 0.15),
                    color: "error.dark",
                  },
                  "&.Mui-selected": {
                    color: "error.dark",
                  },
                })}
              />
            </Tabs>

            <Box sx={{ maxHeight: 300, overflow: "auto" }}>
              <DataTable
                headerCells={tab === 0 ? duplicateTableHeaderCells : invalidTableHeaderCells}
                data={tab === 0 ? duplicateRecords : invalidRecords}
                hidePagination
              />
            </Box>
          </Stack>
        ) : validRecordsCount ? (
          <Typography textAlign="center">All rows are valid. Ready to import?</Typography>
        ) : (
          <Typography textAlign="center">
            No data found. Please upload a file with at least one row of data.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Discard
        </Button>
        <Button variant="contained" onClick={onConfirm} disabled={validRecordsCount === 0}>
          Confirm & Import ({validRecordsCount})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportConfirmationDialog;
