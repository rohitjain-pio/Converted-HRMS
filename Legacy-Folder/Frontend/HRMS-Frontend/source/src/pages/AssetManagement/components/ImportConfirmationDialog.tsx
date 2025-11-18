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

type DuplicateAssetRecord = {
  row: number;
  DeviceName: string;
  SerialNumber: string;
};
type ValidAssetRecord = {
  row: number;
  DeviceName: string;
  SerialNumber: string;
};
type InvalidAssetRecord = { row: number; reason: string };
export type AssetValidationResult = {
  validRecordsCount: number;
  duplicateCount: number;
  duplicateRecords: DuplicateAssetRecord[];
  invalidCount: number;
  invalidRecords: InvalidAssetRecord[];
  validRecords:ValidAssetRecord[]
};

type Props = {
  data: AssetValidationResult;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const duplicateTableHeaderCells = [
  {
    label: "S.No",
    accessor: "sNo",
    width: "10%",
    renderColumn: (_: DuplicateAssetRecord, index: number) => index + 1,
  },
  {
    label: "Row",
    accessor: "row",
    width: "15%",
  },
  {
    label: "Device Name",
    accessor: "DeviceName",
    width: "40%",
  },
  {
    label: "Serial Number",
    accessor: "SerialNumber",
    width: "35%",
  },
];

const invalidTableHeaderCells = [
  {
    label: "S.No",
    accessor: "sNo",
    width: "10%",
    renderColumn: (_: InvalidAssetRecord, index: number) => index + 1,
  },
  {
    label: "Row",
    accessor: "row",
    width: "15%",
  },
  {
    label: "Reason",
    accessor: "reason",
    width: "15%",
  },
];

const validTableHeaderCells = [
  {
    label: "S.No",
    accessor: "sNo",
    width: "10%",
    renderColumn: (_: ValidAssetRecord, index: number) => index + 1,
  },
  {
    label: "Row",
    accessor: "row",
    width: "15%",
  },
  {
    label: "Device Name",
    accessor: "DeviceName",
    width: "40%",
  },
  {
    label: "Serial Number",
    accessor: "SerialNumber",
    width: "35%",
  },
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
    validRecords
  } = data;

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <PageHeader title="Confirm Asset Import" variant="h4" />
      <DialogContent
        dividers
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {duplicateCount || invalidCount ? (
          <Stack gap={2}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                "& .MuiTabs-indicator": {
                  bgcolor:
                    tab === 0
                      ? "success.main"
                      : tab === 1
                        ? "warning.main"
                        : "error.main",
                },
              }}
            >
              <Tab
                label={`Valid (${validRecordsCount})`}
                sx={(theme) => ({
                  "&:hover": {
                    bgcolor: alpha(theme.palette.success.light, 0.2),
                    color: "success.dark",
                  },
                  "&.Mui-selected": {
                    color: "success.dark",
                  },
                })}
              />

              <Tab
                label={`Duplicates (${duplicateCount})`}
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

            <Box>
            
<DataTable
  headerCells={
    tab === 0
      ? validTableHeaderCells
      : tab === 1
      ? duplicateTableHeaderCells
      : invalidTableHeaderCells
  }
  data={
    tab === 0
      ? validRecords 
      : tab === 1
      ? duplicateRecords
      : invalidRecords
  }
  hidePagination
/>

            </Box>
          </Stack>
        ) : validRecordsCount ? (
          <Typography textAlign="center">
            All asset rows are valid. Ready to import?
          </Typography>
        ) : (
          <Typography textAlign="center">
            No valid asset data found. Please upload a file with at least one
            valid row.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          sx={{ minWidth: "120px", fontFamily: "Roboto", fontWeight: 500 }}
          variant="outlined"
          color="inherit"
          onClick={onClose}
        >
          Discard
        </Button>
        <Button
          sx={{ minWidth: "120px", fontFamily: "Roboto", fontWeight: 500 }}
          variant="contained"
          onClick={onConfirm}
          disabled={validRecordsCount === 0}
        >
          Confirm & Import ({validRecordsCount})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportConfirmationDialog;
