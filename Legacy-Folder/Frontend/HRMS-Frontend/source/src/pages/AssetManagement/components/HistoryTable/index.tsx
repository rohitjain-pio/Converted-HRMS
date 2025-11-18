import {
  Box,
  Paper,
} from "@mui/material";
import {
  MRT_SortingState,
  MRT_PaginationState,
} from "material-react-table";
import { useState } from "react";
import {
  initialPagination,
} from "@/utils/constants";
import PageHeader from "@/components/PageHeader/PageHeader";
import { useParams } from "react-router-dom";
import useAsync from "@/hooks/useAsync";

import methods from "@/utils";
import {
  GetItAssetHistory,
  ItAssetHistory,
} from "@/services/AssetManagement/types";
import { getItHistory } from "@/services/AssetManagement";
import { useTableColumns } from "./useTableColumn";
import MaterialDataTable from "@/components/MaterialDataTable";
import { VisibilityState } from "node_modules/@tanstack/table-core/build/lib/features/ColumnVisibility";

export const HistoryTable = () => {
  const { assetId } = useParams();

  const [data, setData] = useState<ItAssetHistory[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] =
    useState<MRT_PaginationState>(initialPagination);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);
  useAsync<GetItAssetHistory>({
    requestFn: async (): Promise<GetItAssetHistory> => {
      return await getItHistory(Number(assetId));
    },
    onSuccess: ({ data }) => {
      setData(data.result || []);
      setTotalRecords(data.result?.length || 0);
    },
    autoExecute: true,
    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const columns = useTableColumns({ pagination });

  return (
    <>
      <Paper elevation={3}>
        <PageHeader variant="h2" title="History" hideBorder={true} />
        <Box padding="20px">
          <MaterialDataTable<ItAssetHistory>
            columns={columns}
            data={data}
            pagination={pagination}
            sorting={sorting}
            columnVisibility={columnVisibility}
            totalRecords={totalRecords}
            setPagination={setPagination}
            setSorting={setSorting}
            setColumnVisibility={setColumnVisibility}
            manualPagination={false}
            manualSorting={true}
          />
        </Box>
      </Paper>
    </>
  );
};
