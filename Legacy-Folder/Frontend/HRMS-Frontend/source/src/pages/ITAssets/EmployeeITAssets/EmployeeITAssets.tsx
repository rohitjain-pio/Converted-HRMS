import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import PageHeader from "@/components/PageHeader/PageHeader";
import DataTable from "@/components/DataTable/DataTable";
import useAsync from "@/hooks/useAsync";
import {
  EmployeeAsset,
  getEmployeeAsset,
  GetEmployeeAssetResponse,
} from "@/services/AssetManagement";
import { useUserStore } from "@/store";
import { useState } from "react";
import methods from "@/utils";
import { useSearchParams } from "react-router-dom";
import { getEmployeeAssetHeaderCells } from "@/pages/ITAssets/EmployeeITAssets/EmployeeItAssetColumns";

const EmployeeITAssets = () => {
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const [employeeAssets, setEmployeeAssets] = useState<EmployeeAsset[]>([]);
  const [startIndex, setStartIndex] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { isLoading } = useAsync<GetEmployeeAssetResponse>({
    requestFn: async (): Promise<GetEmployeeAssetResponse> => {
      return await getEmployeeAsset(Number(employeeId || userData.userId));
    },
    onSuccess: ({ data }) => {
      setEmployeeAssets(data.result || []);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    autoExecute: true,
  });

  const headerCells =getEmployeeAssetHeaderCells(startIndex,pageSize);
  const paginatedAssets = employeeAssets.slice(
    (startIndex - 1) * pageSize,
    startIndex * pageSize
  );

  return (
    <>
      <PageHeader
        variant="h3"
        title="Allocated Asset Details"
        containerStyles={{ paddingX: 0, paddingTop: 0 }}
      />
      <Box>
        {isLoading ? (
          <Box
            height={"calc(100vh - 80px)"}
            justifyContent="center"
            alignItems="center"
            display="flex"
          >
            <CircularProgress />
          </Box>
        ) : (
          <DataTable
            data={paginatedAssets}
            headerCells={headerCells}
            pageSize={pageSize}
            setPageSize={setPageSize}
            startIndex={startIndex}
            setStartIndex={setStartIndex}
            totalRecords={employeeAssets.length}
          />
        )}
      </Box>
    </>
  );
};

export default EmployeeITAssets;
