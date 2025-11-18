import { Box } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import RouterMaterialLink from "./RouterMaterialLink";
import { CompanyPolicyType } from "@/services/CompanyPolicies";
import { formatDate } from "@/utils/formatDate";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { Link } from "react-router-dom";
const { VIEW,  EDIT } = permissionValue.COMPANY_POLICY;

export const getCompanyPolicyTableHeaders = (
  startIndex: number,
  pageSize: number
) => [
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
        <TruncatedText text={row.name} tooltipTitle={row.name} maxLength={20} />
      ),
  },
  { label: "Version", accessor: "versionNo", width: "50px" },
  { label: "Category", accessor: "documentCategory", width: "130px" },
  { label: "Created By", accessor: "createdBy", width: "130px" },
  {
    label: "Created On",
    accessor: "createdOn",
    width: "200px",
    renderColumn: (row: CompanyPolicyType) => formatDate(row.createdOn),
  },
  { label: "Updated By", accessor: "modifiedBy", width: "130px" },
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
