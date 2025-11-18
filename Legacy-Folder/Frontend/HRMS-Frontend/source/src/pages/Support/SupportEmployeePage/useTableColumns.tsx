import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import { EmployeeFeedbackType } from "@/services/Support/types";
import { BUG_TYPE_LABEL, FEEDBACK_STATUS_LABEL } from "@/utils/constants";
import { formatDate } from "@/utils/formatDate";
import { Visibility } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { MRT_ColumnDef, MRT_PaginationState } from "material-react-table";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

type UseTableColumnsProps = {
  pagination: MRT_PaginationState;
};
export const useTableColumns = ({ pagination }: UseTableColumnsProps) => {
  const navigate = useNavigate();
  const columns = useMemo<MRT_ColumnDef<EmployeeFeedbackType>[]>(
    () => [
      {
        header: "Support ID",
        accessorKey: "id",
        size: 100,
      },

      {
        header: "Ticket Type",
        accessorKey: "ticketStatus",
        accessorFn: (row) => FEEDBACK_STATUS_LABEL[row.ticketStatus],

        size: 180,
      },
      {
        header: "Type",
        accessorKey: "bugType",
        accessorFn: (row) => BUG_TYPE_LABEL[row.feedbackType],
        size: 140,
      },
      {
        header: "Subject",
        accessorKey: "subject",
        accessorFn: (row) => (
          <TruncatedText
            maxLength={60}
            text={row.subject}
            tooltipTitle={row.subject}
          />
        ),

        size: 200,
      },
      {
        header: "Description",
        accessorKey: "description",
        accessorFn: (row) => (
          <TruncatedText
            maxLength={90}
            text={row.description}
            tooltipTitle={row.description}
          />
        ),

        size: 250,
      },
      {
        header: "Created On",
        accessorKey: "createdOn",
        accessorFn: (row) => formatDate(row.createdOn),
        size: 150,
      },

      {
        header: "Actions",
        visibleInShowHideMenu: false,
        id: "actions",
        size: 120,
        enableSorting: false,
        enablePinning: true,
        accessorFn: (row) => (
          <Tooltip title="View Details">
            <IconButton
              aria-label="View"
              onClick={() => {
                navigate(`/Support/Support-Details/${row.id}`);
              }}
            >
              <Visibility color="primary" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [pagination]
  );
  return columns;
};
