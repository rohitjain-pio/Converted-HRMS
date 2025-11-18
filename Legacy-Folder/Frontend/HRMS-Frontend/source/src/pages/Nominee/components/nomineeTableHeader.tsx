import { Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import { NomineeType } from "@/services/Nominee";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import { formatDate } from "@/utils/formatDate";
import { permissionValue } from "@/utils/constants";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";
import { hasPermission } from "@/utils/hasPermission";
import ViewNomineeDocument from "./ViewNomineeDocument";

const { NOMINEE_DETAILS } = permissionValue;

export const getNomineeTableHeaders = (
  startIndex: number,
  pageSize: number,
  handleEditClick: (row: NomineeType) => void,
  openDeleteDialog: (id: number) => void
) => [
  {
    label: "S.No",
    accessor: "sNo",
    width: "50px",
    renderColumn: (_row: NomineeType, index: number) =>
      (startIndex - 1) * pageSize + index + 1,
  },
  {
    label: "Name",
    accessor: "nomineeName",
    enableSorting: true,
    width: "250px",
    renderColumn: (row: NomineeType) => (
      <TruncatedText
        text={row.nomineeName}
        tooltipTitle={row.nomineeName}
        maxLength={20}
      />
    ),
  },
  {
    label: "Relationship",
    accessor: "relationshipName",
    width: "200px",
    renderColumn: (row: NomineeType) =>
      row.relationshipName === "Others" ? row.others : row.relationshipName,
  },
  {
    label: "DOB",
    accessor: "dob",
    width: "130px",
    renderColumn: (row: NomineeType) => formatDate(row.dob),
  },
  { label: "Age", accessor: "age", width: "130px" },
  { label: "Care/of", accessor: "careOf", width: "100px" },
  {
    label: "Percentage",
    accessor: "percentage",
    width: "130px",
    renderColumn: (row: NomineeType) => `${row.percentage}%`,
  },
  {
    label: "Attachment",
    accessor: "attachment",
    width: "50px",
    renderColumn: (row: NomineeType) => (
      <ViewNomineeDocument
        fileName={row?.fileName as string}
        hasPermission={hasPermission(NOMINEE_DETAILS.VIEW)}
      />
    ),
  },
  ...(hasPermission(NOMINEE_DETAILS.EDIT) ||
  hasPermission(NOMINEE_DETAILS.DELETE)
    ? [
        {
          label: "Actions",
          accessor: "actions",
          width: "100px",
          renderColumn: (row: NomineeType) => (
            <Box
              role="group"
              aria-label="Action buttons"
              sx={{ display: "flex", gap: "10px" }}
            >
              {hasPermission(NOMINEE_DETAILS.EDIT) && (
                <ActionIconButton
                  label="Edit Nominee"
                  colorType="primary"
                  onClick={() => handleEditClick(row)}
                  icon={<EditIcon />}
                />
              )}
              {hasPermission(NOMINEE_DETAILS.DELETE) && (
                <ActionIconButton
                  label="Delete Nominee"
                  colorType="error"
                  onClick={() => openDeleteDialog(row.id)}
                  icon={<Delete />}
                />
              )}
            </Box>
          ),
        },
      ]
    : []),
];
