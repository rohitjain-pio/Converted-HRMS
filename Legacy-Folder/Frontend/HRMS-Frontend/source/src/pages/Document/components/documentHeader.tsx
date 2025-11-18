import { Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { UserDocumentType } from "@/services/Documents";
import { formatDate } from "@/utils/formatDate";
import { permissionValue } from "@/utils/constants";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { hasPermission } from "@/utils/hasPermission";
import ViewDocument from "@/pages/ExitEmployee/components/ViewDocument";

const { EDIT, VIEW } = permissionValue.PERSONAL_DETAILS;

export const getUserDocumentTableHeaders = (
  handleEditClick: (row: UserDocumentType) => void
) => [
  {
    label: "S.No",
    accessor: "sNo",
    width: "50px",
    renderColumn: (_row: UserDocumentType, index: number) => index + 1,
  },
  {
    label: "Document Type",
    accessor: "documentType",
    width: "250px",
  },
  {
    label: "Document Number",
    accessor: "documentNumber",
    width: "250px",
  },
  {
    label: "Expiry",
    accessor: "documentExpiry",
    width: "130px",
    renderColumn: (row: UserDocumentType) => formatDate(row.documentExpiry),
  },
  {
    label: "Attachment",
    accessor: "attachment",
    width: "50px",
    renderColumn: (row: UserDocumentType) => (
      <ViewDocument
        filename={row.location || ""}
        containerType={1}
        hasPreviewPermission={hasPermission(VIEW)}
      />
    ),
  },
  ...(hasPermission(EDIT)
    ? [
        {
          label: "Actions",
          accessor: "actions",
          width: "100px",
          renderColumn: (row: UserDocumentType) => (
            <Box
              role="group"
              aria-label="Action buttons"
              sx={{ display: "flex", gap: "10px" }}
            >
              <ActionIconButton
                label="Edit Document"
                colorType="primary"
                icon={<EditIcon onClick={() => handleEditClick(row)} />}
              />
            </Box>
          ),
        },
      ]
    : []),
];
