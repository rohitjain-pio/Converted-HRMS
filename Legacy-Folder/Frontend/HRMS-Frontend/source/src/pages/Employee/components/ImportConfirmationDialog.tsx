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

type DuplicateRecord = { code: number; email: string };
type InvalidRecord = { row: number; reason: string };

export type ValidationResult = {
  validRecordsCount: number;
  duplicateCount: number;
  duplicateRecords: DuplicateRecord[];
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
    renderColumn: (_: DuplicateRecord, index: number) => index + 1,
  },
  {
    label: "Employee Code",
    accessor: "code",
    width: "30%",
  },
  {
    label: "Email",
    accessor: "email",
    width: "60%",
  },
];

const invalidTableHeaderCells = [
  {
    label: "S.No",
    accessor: "sNo",
    width: "10%",
    renderColumn: (_: InvalidRecord, index: number) => index + 1,
  },
  {
    label: "Row",
    accessor: "row",
    width: "30%",
  },
  {
    label: "Reason",
    accessor: "reason",
    width: "60%",
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
  } = data;

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <PageHeader title="Confirm Import" variant="h4" />
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
                  bgcolor: tab == 0 ? "warning.main" : "error.main",
                },
              }}
            >
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
                sx={(theme) => ({
                  "&:hover": {
                    bgcolor: alpha(theme.palette.error.light, 0.15),
                    color: "error.dark",
                  },
                  "&.Mui-selected": {
                    color: "error.dark",
                  },
                })}
                label={`Invalid (${invalidCount})`}
              />
            </Tabs>

            <Box sx={{ maxHeight: 300, overflow: "auto" }}>
              <DataTable
                headerCells={
                  tab === 0
                    ? duplicateTableHeaderCells
                    : invalidTableHeaderCells
                }
                data={tab === 0 ? duplicateRecords : invalidRecords}
                hidePagination
              />
            </Box>
          </Stack>
        ) : validRecordsCount ? (
          <Typography textAlign="center">
            All rows are valid. Ready to import?
          </Typography>
        ) : (
          <Typography textAlign="center">
            No data found. Please upload a file with at least one row of data.
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          sx={{
            minWidth: "120px",
            fontFamily: "Roboto",
            fontWeight: 500,
          }}
          variant="outlined"
          color="inherit"
          onClick={onClose}
        >
          Discard
        </Button>
        <Button
          sx={{
            minWidth: "120px",
            fontFamily: "Roboto",
            fontWeight: 500,
          }}
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
