import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "@/components/PageHeader/PageHeader";
import DataTable from "@/components/DataTable/DataTable";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { formatDate } from "@/utils/formatDate";
import {
  CompanyPolicyListSearchFilter,
  CompanyPolicyType,
  GetCompanyPolicyListResponse,
  getCompanyPolicyList,
} from "@/services/CompanyPolicies";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import RouterMaterialLink from "@/pages/CompanyPolicy/components/RouterMaterialLink";
import FilterForm from "@/pages/CompanyPolicy/components/FilterForm";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import { CompanyPolicyStatus, permissionValue } from "@/utils/constants";
import { hasPermission } from "@/utils/hasPermission";
import BreadCrumbs from "@/components/@extended/Router";

const CompanyPolicy = () => {
  const [data, setData] = useState<CompanyPolicyType[]>([]);
  const [sortColumnName, setSortColumnName] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<string>("");
  const [startIndex, setStartIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [name, setName] = useState<string | undefined>("");
  const [documentCategoryId, setDocumentCategoryId] = useState<
    number | string | undefined
  >(0);
  const [statusId, setStatusId] = useState<number | string | undefined>(
    CompanyPolicyStatus.Active
  );
  const navigate = useNavigate();

  const { VIEW, CREATE, EDIT } = permissionValue.COMPANY_POLICY;

  const { execute: fetchCompanyPolicies } =
    useAsync<GetCompanyPolicyListResponse>({
      requestFn: async (): Promise<GetCompanyPolicyListResponse> => {
        return await getCompanyPolicyList({
          sortColumnName,
          sortDirection,
          startIndex,
          pageSize,
          filters: {
            name,
            documentCategoryId,
            statusId,
          },
        });
      },
      onSuccess: ({ data }) => {
        setData(data.result?.companyPolicyList || []);
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
      width: "50px",
      renderColumn: (_row: CompanyPolicyType, index: number) =>
        (startIndex - 1) * pageSize + index + 1,
    },
    {
      label: "Document Name",
      accessor: "name",
      enableSorting: true,
      width: "250px",
      renderColumn: (row: CompanyPolicyType) =>
        hasPermission(VIEW) ? (
          <RouterMaterialLink to={`/company-policy/view/${row.id}`}>
            <TruncatedText
              text={row.name}
              tooltipTitle={row.name}
              maxLength={20}
            />
          </RouterMaterialLink>
        ) : (
          <TruncatedText
            text={row.name}
            tooltipTitle={row.name}
            maxLength={20}
          />
        ),
    },
    { label: "Version", accessor: "versionNo", width: "50px" },
    { label: "Category", accessor: "documentCategory", width: "130px" },
    { label: "Created By", accessor: "createdBy", width: "130px" },
    {
      label: "Created On",
      accessor: "createdOn",
      
  enableSorting: true,

      width: "200px",
      renderColumn: (row: CompanyPolicyType) => formatDate(row.createdOn),
    },
    { label: "Updated By", accessor: "modifiedBy", width: "130px" },
    {
      label: "Updated On",
      accessor: "modifiedOn",
      
  enableSorting: true,

      width: "200px",
      renderColumn: (row: CompanyPolicyType) =>row.modifiedOn? formatDate(row.modifiedOn):"N/A",
    },
    { label: "Status", accessor: "status", width: "130px" },
    ...(hasPermission(VIEW) || hasPermission(EDIT)
      ? [
          {
            label: "Actions",
            accessor: "actions",
            width: "100px",
            renderColumn: (row: CompanyPolicyType) => (
              <Box
                role="group"
                aria-label="Action buttons"
                sx={{ display: "flex", gap: "10px" }}
              >
                {hasPermission(VIEW) && (
                  <ActionIconButton
                    label="View Document Details"
                    colorType="primary"
                    as={Link}
                    icon={<VisibilityIcon />}
                    to={`/company-policy/view/${row.id}`}
                  />
                )}

                {hasPermission(EDIT) && (
                  <ActionIconButton
                    label="Edit Document"
                    colorType="primary"
                    as={Link}
                    icon={<EditIcon />}
                    to={`/company-policy/edit/${row.id}`}
                  />
                )}
              </Box>
            ),
          },
        ]
      : []),
  ];

  const handleSearch = async ({
    name,
    documentCategoryId,
    statusId,
  }: CompanyPolicyListSearchFilter) => {
    setName(name);
    setDocumentCategoryId(documentCategoryId || 0);
    setStatusId(statusId || 0);
    setStartIndex(1);
  };

  useEffect(() => {
    fetchCompanyPolicies();
  }, [
    sortColumnName,
    sortDirection,
    startIndex,
    pageSize,
    name,
    documentCategoryId,
    statusId,
  ]);

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader
          variant="h2"
          title="Company Policy"
          hideBorder={true}
          actionButton={
            <FilterForm
              onSearch={handleSearch}
              addIcon={
                hasPermission(CREATE) && (
                  <RoundActionIconButton
                    onClick={() => navigate("/company-policy/add")}
                    label="Add Document"
                    size="small"
                    icon={<AddIcon />}
                  />
                )
              }
            />
          }
        ></PageHeader>
        <Box paddingX="20px">
          <DataTable

            data={data}
            headerCells={headerCells}
            setSortColumnName={setSortColumnName}
            setSortDirection={setSortDirection}
            setStartIndex={setStartIndex}
            startIndex={startIndex}
            setPageSize={setPageSize}
            pageSize={pageSize}
            totalRecords={totalRecords}
          />
        </Box>
      </Paper>
    </>
  );
};

export default CompanyPolicy;
