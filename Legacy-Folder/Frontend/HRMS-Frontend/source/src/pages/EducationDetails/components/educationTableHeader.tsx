
import { Box } from "@mui/material";
import moment from "moment";
import EditIcon from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import { EducationDetailType } from "@/services/EducationDetails";
import { hasPermission } from "@/utils/hasPermission";
import { permissionValue } from "@/utils/constants";
import ViewDocument from "@/pages/ExitEmployee/components/ViewDocument";
import ActionIconButton from "@/components/ActionIconButton/ActionIconButton";


const {EDUCATIONAL_DETAILS}=permissionValue
export const getEducationTableHeaders = (
  openEditEducationDetailDialog: (row: EducationDetailType) => void,
  openDeleteDialog: (id: number) => void)=>
   [
    {
      label: "S.No",
      accessor: "sNo",
      width: "50px",
      renderColumn: (_: EducationDetailType, index: number) => index + 1,
    },
    {
      label: "Qualification",
      accessor: "qualificationName",
      width: "50px",
    },
    {
      label: "Degree",
      accessor: "degreeName",
      width: "50px",
    },
    {
      label: "College/University",
      accessor: "collegeUniversity",
      width: "50px",
    },
    {
      label: "Start Year",
      accessor: "startYear",
      width: "50px",
      renderColumn: (row: EducationDetailType) =>
        moment(row.startYear, "MM-YYYY").format("MMM YYYY"),
    },
    {
      label: "End Year",
      accessor: "endYear",
      width: "50px",
      renderColumn: (row: EducationDetailType) =>
        moment(row.endYear, "MM-YYYY").format("MMM YYYY"),
    },
    {
      label: "Aggregate Percentage",
      accessor: "aggregatePercentage",
      width: "50px",
      renderColumn: (row: EducationDetailType) => `${row.aggregatePercentage}%`,
    },
    {
      label: "Attachment",
      accessor: "attachment",
      width: "50px",
      renderColumn: (row: EducationDetailType) => (
        <ViewDocument
          filename={row.fileName || ""}
        containerType={1}
        />
      ),
    },
    ...(hasPermission(EDUCATIONAL_DETAILS.EDIT) ||
    hasPermission(EDUCATIONAL_DETAILS.DELETE)
      ? [
          {
            label: "Actions",
            accessor: "actions",
            width: "100px",
            renderColumn: (row: EducationDetailType) => (
              <Box
                role="group"
                aria-label="Action buttons"
                sx={{ display: "flex", gap: "10px" }}
              >
                {hasPermission(EDUCATIONAL_DETAILS.EDIT) && (
                  <ActionIconButton
                    label="Edit Education"
                    colorType="primary"
                    onClick={() => openEditEducationDetailDialog(row)}
                    icon={<EditIcon />}
                  />
                )}
                {hasPermission(EDUCATIONAL_DETAILS.DELETE) && (
                  <ActionIconButton
                    label="Delete Education"
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
