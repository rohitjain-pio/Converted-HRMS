import { Dialog, DialogContent, IconButton, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import useAsync from "@/hooks/useAsync";

import DataTable from "@/components/DataTable/DataTable";

import PageHeader from "@/components/PageHeader/PageHeader";
import {
  getManagerRatingHistory,
  GetManagerRatingHistoryResponse,
  ManagerRatingHistory,
  ManagerRatingHistoryRequest,
} from "@/services/KPI";
import methods from "@/utils";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import { formatDate } from "@/utils/formatDate";

type KpiRatingConfirmDialogProps = {
  planId: number;
  goalId: number;
  open: boolean;
  onClose: () => void;
};

export const KpiRatingHistoryDialog = ({
  planId,
  goalId,
  open,
  onClose,
}: KpiRatingConfirmDialogProps) => {
  const [startIndex, setStartIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [rows, setRows] = useState<ManagerRatingHistory[]>([]);

  const { isLoading, execute } = useAsync<
    GetManagerRatingHistoryResponse,
    ManagerRatingHistoryRequest
  >({
    requestFn: async () =>
      await getManagerRatingHistory({ planId: Number(planId), goalId: goalId }),
    onSuccess: ({ data }) => {
      setRows(data.result);
      setTotalRecords(data.result.length);
    },
    onError(error) {
      methods.throwApiError(error);
    },
  });
  useEffect(() => {
    if (open) {
      execute();
    }
  }, [goalId, open]);
  const headerCells = [
    {
      label: "S.No",
      accessor: "sNo",
      width: "10px",
      renderColumn: (_: ManagerRatingHistory, index: number) =>
        (startIndex - 1) * pageSize + index + 1,
    },
    { label: "Rating", accessor: "managerRating", width: "90px" },
    {
      label: "Comment",
      accessor: "managerComment",
      width: "140px",
      maxLength: 80,
    },
    {
      label: "Updated At",
      accessor: "createdAt",
      width: "100px",
      renderColumn: (row: ManagerRatingHistory) => formatDate(row.createdOn),
    },
    { label: "Updated By", accessor: "managerName", width: "80px" },
  ];

  const paginatedRows = rows.slice(
    (startIndex - 1) * pageSize,
    startIndex * pageSize
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <PageHeader
        title="Manage Rating History"
        variant="h3"
        actionButton={
          <IconButton
            aria-label="close"
            onClick={onClose}
            //   sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        }
      />
      <DialogContent>
        <Box>
          <DataTable
            data={paginatedRows}
            headerCells={headerCells}
            setStartIndex={setStartIndex}
            startIndex={startIndex}
            setPageSize={setPageSize}
            pageSize={pageSize}
            totalRecords={totalRecords}
          />
        </Box>
      </DialogContent>
      <GlobalLoader loading={isLoading} />
    </Dialog>
  );
};
