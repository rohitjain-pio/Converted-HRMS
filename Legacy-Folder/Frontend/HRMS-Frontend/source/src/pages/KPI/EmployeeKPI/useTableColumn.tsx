import { MRT_Column, MRT_ColumnDef, MRT_Row } from "material-react-table";
import { useMemo } from "react";
import { GetEmployeeSelfRatingResponse, GoalRating } from "@/services/KPI";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { Quarter, QUARTERS_IN_ORDER } from "@/utils/constants";

import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import { CellAction } from "@/pages/KPI/KpiDetails";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { parseQuarterCsv, quarterFieldMap } from "@/pages/KPI/utils";
import QuarterCell from "@/pages/KPI/EmployeeKPI/QuarterCell";
export type UseTableColumnsProps = {
  handleTableCellMouseLeave: () => void;
  handleTableCellMouseEnter: (
    row: MRT_Row<GoalRating>,
    column: MRT_Column<GoalRating, unknown>
  ) => () => void;
  hoveredCell: {
    rowIndex: number;
    columnIndex: number;
  } | null;
  setSelectedQuarterCell: React.Dispatch<
    React.SetStateAction<{
      quarter: Quarter;
      goalId: number;
      goalTitle: string;
      rating: number | null;
      note: string | null;
    } | null>
  >;
  setSelectedManagerCell: React.Dispatch<
    React.SetStateAction<{
      goalId: number;
      goalTitle: string;
      managerRating: number;
      managerNote: string;
    } | null>
  >;
  setCellAction: React.Dispatch<React.SetStateAction<CellAction | null>>;
  data: GetEmployeeSelfRatingResponse | null;
};

export const useTableColumns = ({
  handleTableCellMouseLeave,
  handleTableCellMouseEnter,
  hoveredCell,
  setCellAction,
  setSelectedManagerCell,
  setSelectedQuarterCell,
  data,
}: UseTableColumnsProps) => {
  const quarterColumns = QUARTERS_IN_ORDER.map((quarter) => {
    const colDef: MRT_ColumnDef<GoalRating> = {
      header: `${quarter} Self-Evaluation`,
      id: quarter,
      size: 100,
      muiTableBodyCellProps: ({ row, column }) => ({
        sx: (theme) => ({
          borderRight: `1px solid ${theme.palette.divider}`,
          bgcolor: !parseQuarterCsv(row.original.allowedQuarter).includes(
            quarter
          )
            ? "action.disabled"
            : "",
          cursor: !parseQuarterCsv(row.original.allowedQuarter).includes(
            quarter
          )
            ? "not-allowed"
            : "auto",
        }),
        onMouseEnter: handleTableCellMouseEnter(row, column),
        onMouseLeave: handleTableCellMouseLeave,
      }),
      Cell: ({ row, column }) => {
        const hovered =
          !!hoveredCell &&
          hoveredCell.rowIndex === row.index &&
          hoveredCell.columnIndex === column.getIndex();

        const { goalId, goalTitle, status, allowedQuarter } = row.original;

        const { ratingKey, noteKey } = quarterFieldMap[quarter];

        const rating = row.original[ratingKey];
        const note = row.original[noteKey];

        const disabledCell = !parseQuarterCsv(allowedQuarter).includes(quarter);
        let action: CellAction | null = disabledCell
          ? null
          : status === null
            ? "add"
            : status === false
              ? "edit"
              : "view";
        if(data?.result[0].isReviewed!==null){
          action="view"
        }
        return (
          <QuarterCell
            rating={rating}
            hovered={hovered}
            disabled={disabledCell}
            action={action}
            onAction={
              action
                ? () => {
                    setSelectedQuarterCell({
                      goalId,
                      goalTitle,
                      quarter: quarter,
                      rating,
                      note,
                    });
                    setCellAction(action);
                  }
                : undefined
            }
          />
        );
      },
    };

    return colDef;
  });

  const columns = useMemo<MRT_ColumnDef<GoalRating>[]>(
    () => [
      {
        header: "Goal",
        accessorKey: "goalTitle",
        size: 150,
      },
      {
        header: "Target",
        size: 200,
        muiTableBodyCellProps: {
          sx: (theme) => ({
            borderRight: `1px solid ${theme.palette.divider}`,
          }),
        },
        Cell: ({ row }) => {
          const { targetExpected } = row.original;

          return (
            <>
              {targetExpected ? (
                <TruncatedText
                  text={targetExpected}
                  tooltipTitle={String(targetExpected)}
                  maxLength={40}
                />
              ) : (
                <Typography color="text.secondary">No Target</Typography>
              )}
            </>
          );
        },
      },
      ...quarterColumns,
      {
        header: "Manager Review",
        id: "mangerReview",
        size: 150,
        muiTableBodyCellProps: ({ row, column }) => ({
          onMouseEnter: handleTableCellMouseEnter(row, column),
          onMouseLeave: handleTableCellMouseLeave,
        }),
        Cell: ({ row, column }) => {
          const hovered =
            !!hoveredCell &&
            hoveredCell.rowIndex === row.index &&
            hoveredCell.columnIndex === column.getIndex();

          const { goalId, goalTitle, managerNote, managerRating } =
            row.original;

          if (managerRating === null || data?.result[0].isReviewed != true) {
            return (
              <Typography sx={{ color: "text.secondary" }}>
                No review yet
              </Typography>
            );
          }

          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
            >
              <Typography>{managerRating}</Typography>
              {hovered ? (
                <Tooltip title="View More">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      setSelectedManagerCell({
                        managerRating,
                        managerNote: String(managerNote),
                        goalId,
                        goalTitle,
                      });
                      setCellAction("view");
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ) : (
                // Render a placeholder so the cell layout doesn't jump
                <Box sx={{ width: 30, height: 30 }} />
              )}
            </Box>
          );
        },
      },
    ],
    [hoveredCell, quarterColumns]
  );
  return columns;
};
