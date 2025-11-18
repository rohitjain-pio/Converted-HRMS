import { useEffect, useState } from "react";
import { Box, Paper } from "@mui/material";
import PageHeader from "@/components/PageHeader/PageHeader";
import DataTable from "@/components/DataTable/DataTable";
import { formatDate } from "@/utils/formatDate";
import {
  CompanyPolicyType,
  GetCompanyPolicyHistoryResponse,
  getCompanyPolicyHistory,
} from "@/services/CompanyPolicies";
import methods from "@/utils";
import useAsync from "@/hooks/useAsync";
import { useParams } from "react-router-dom";
import { hasPermission } from "@/utils/hasPermission";
import ViewDocument from "@/pages/CompanyPolicy/components/ViewDocument";
import { permissionValue } from "@/utils/constants";

const DocumentHistory = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CompanyPolicyType[]>([]);
  const [startIndex, setStartIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const { VIEW } = permissionValue.COMPANY_POLICY;

  const { execute: fetchCompanyPolicyHistory } =
    useAsync<GetCompanyPolicyHistoryResponse>({
      requestFn: async (): Promise<GetCompanyPolicyHistoryResponse> => {
        return await getCompanyPolicyHistory({
          startIndex,
          pageSize,
          filters: {
            policyId: id as string,
          },
        });
      },
      onSuccess: ({ data }) => {
        setData(data.result?.companyPolicyHistoryResponseDto || []);
        setTotalRecords(data.result?.totalRecords || 0);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
      autoExecute: false,
    });

  const headerCells = [
    {
      label: "S.No",
      accessor: "sNo",
      renderColumn: (_row: CompanyPolicyType, index: number) =>
        (startIndex - 1) * pageSize + index + 1,
      width: "50px",
    },
    { label: "Description", accessor: "description", width: "200px" },
    {
      label: "Attachment",
      accessor: "attachment",
      width: "50px",
      renderColumn: (row: CompanyPolicyType) => (
        <ViewDocument
          companyPolicyId={id as string}
          fileName={row?.fileName as string}
          fileOriginalName={row.fileOriginalName as string}
          hasPermission={hasPermission(VIEW)}
        />
      ),
    },
    { label: "Version", accessor: "versionNo", width: "100px" },
    {
      label: "Created On",
      accessor: "createdOn",
      width: "130px",
      renderColumn: (row: CompanyPolicyType) => formatDate(row.createdOn),
    },
    {
      label: "Updated By",
      accessor: "modifiedBy",
      renderColumn: (row: CompanyPolicyType) =>
        row.modifiedBy ? row.modifiedBy : "N/A",
      width: "130px",
    },
    {
      label: "Updated On",
      accessor: "modifiedOn",
      width: "130px",
      renderColumn: (row: CompanyPolicyType) =>
        row.modifiedOn ? formatDate(row.modifiedOn) : "N/A",
    },
  ];

  useEffect(() => {
    fetchCompanyPolicyHistory();
  }, [startIndex, pageSize, id]);

  return (
    <Paper>
      <PageHeader
        variant="h4"
        title="Document History"
        color="primary"
        hideBorder
      />
      <Box paddingX="20px" paddingBottom="40px">
        <DataTable
          data={data}
          headerCells={headerCells}
          setStartIndex={setStartIndex}
          startIndex={startIndex}
          setPageSize={setPageSize}
          pageSize={pageSize}
          totalRecords={totalRecords}
        />
      </Box>
    </Paper>
  );
};

export default DocumentHistory;
