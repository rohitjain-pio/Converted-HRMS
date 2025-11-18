import { MRT_Column, MRT_ColumnDef, MRT_Row } from "material-react-table";
import { useMemo } from "react";
import { GetEmployeeRatingByManager, GoalRating, PlanRating } from "@/services/KPI";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { Quarter, QUARTERS_IN_ORDER } from "@/utils/constants";
import { parseQuarterCsv, quarterFieldMap } from "@/pages/KPI/utils";
import QuarterCell from "@/pages/KPI/KpiDetails//QuarterCell";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import { CellAction } from "@/pages/KPI//KpiDetails";
import EditIcon from "@mui/icons-material/Edit";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import VisibilityIcon from "@mui/icons-material/Visibility";
import { AssignedCell, CellPosition, SelectedCell } from "@/pages/KPI/KpiDetails/type";
export type UseTableColumnsProps = {
  handleTableCellMouseLeave: () => void;
  handleTableCellMouseEnter: (
    row: MRT_Row<GoalRating>,
    column: MRT_Column<GoalRating, unknown>
  ) => () => void;
  hoveredCell: CellPosition;
  data: GetEmployeeRatingByManager|undefined;
  setSelectedCell: (data: SelectedCell) => void;
  setActiveCell: (data: CellPosition) => void;
  activeCell: CellPosition;
  setAssignGoalOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setAssignedCell: (data: AssignedCell) => void;
  goalData: PlanRating|undefined;
  setDialogType: (mode: "view" | "edit") => void;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleOpenDialog:(goalId:number)=>void
};

export const useTableColumns = ({
  handleTableCellMouseEnter,
  handleTableCellMouseLeave,
  setDialogType,
  setOpenDialog,
  goalData,
  setAssignedCell,
  hoveredCell,
  handleOpenDialog,
  data,
  setActiveCell,
  setSelectedCell,
  setAssignGoalOpenDialog,
  activeCell,
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
        const { goalId, goalTitle, allowedQuarter } = row.original;

        const { ratingKey, noteKey } = quarterFieldMap[quarter];

        const rating = row.original[ratingKey];
        const note = row.original[noteKey];
        const status = rating ? true : null;
        const disabledCell = !parseQuarterCsv(allowedQuarter).includes(quarter);
        const action: CellAction | null =
          disabledCell || status == null ? null : "view";

        return (
          <QuarterCell
            rating={rating}
            hovered={hovered}
            disabled={disabledCell}
            action={action}
            status={!status}
            onAction={
              action
                ? () => {
                    setSelectedCell({
                      goalId,
                      goalTitle,
                      quarter: quarter,
                      rating,
                      note,
                      isEditable: false,
                    });
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
        accessorKey: "targetExpected",
        size: 200,
        Cell: ({ row, column }) => {
          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
              onMouseEnter={() => {
                setActiveCell({
                  rowIndex: row.index,
                  columnIndex: column.getIndex(),
                });
              }}
              onMouseLeave={() => setActiveCell(null)}
            >
              {row.original.targetExpected ? (
                <TruncatedText
                  text={row.original.targetExpected}
                  tooltipTitle={String(row.original.targetExpected)}
                  maxLength={40}
                />
              ) : (
                <Typography color="text.secondary">
                  {row.original.status ? "No Target" : "Assign Target"}
                </Typography>
              )}

              {activeCell?.rowIndex === row.index &&
                activeCell?.columnIndex === column.getIndex() &&
                !goalData?.isReviewed && (
                  <Tooltip title="Edit Target & Quarter">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setAssignGoalOpenDialog(true);
                        setAssignedCell({
                          goalId: row.original.goalId,
                          target: row.original.targetExpected
                            ? String(row.original.targetExpected)
                            : "",
                          quarter: String(row.original.allowedQuarter),
                          isDisabled: true,
                          employeeId: Number(data?.employeeId),
                          employeeEmail: data?.email,
                          plainId: Number(goalData?.planId),
                          employeeName: String(data?.employeeName),
                        });
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
            </Box>
          );
        },
      },
      {
        header: "Manager Review",
        id: "managerReview",
        size: 150,
        Cell: ({ row, column }) => (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
            onMouseEnter={() => {
              setActiveCell({
                rowIndex: row.index,
                columnIndex: column.getIndex(),
              });
            }}
            onMouseLeave={() => setActiveCell(null)}
          >
            <Typography
              color={
                row.original.managerRating ? "text.primary" : "text.secondary"
              }
            >
              {row.original.managerRating ?? "Add"}
            </Typography>

            {activeCell?.rowIndex === row.index &&
              activeCell?.columnIndex === column.getIndex() && (
                <Box sx={{display:"flex", gap:1}}>
                  <Tooltip
                    title={
                      !goalData?.isReviewed
                        ? row.original.managerRating
                          ? "Edit Rating"
                          : "Add Rating"
                        : "View Rating"
                    }
                  >
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setOpenDialog(true);
                        const mode = goalData?.isReviewed
                          ? "view"
                          : "edit";
                        setDialogType(mode);

                        setSelectedCell({
                          goalId: row.original.goalId,
                          goalTitle: row.original.goalTitle,
                          quarter: Quarter.Q4,
                          rating: row.original.managerRating,
                          note: row.original.managerNote,
                          isEditable: true,
                        });
                      }}
                    >
                      {goalData?.isReviewed ? (
                        <VisibilityIcon fontSize="small" />
                      ) : (
                        <EditIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                    {row.original.managerRating&&(
                  <Tooltip title="Manager rating info">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(row.original.goalId)}
                    >
                      <InfoOutlinedIcon fontSize="small"  />
                    </IconButton>
                  </Tooltip>)}
                </Box>
              )}
          </Box>
        ),
      },
      {
        header: "Overall Progress %",
        id: "overallProgress",
        size: 150,

        Cell: ({ row }) => {
          const totalQuarter =
            row.original.allowedQuarter?.split(",").length || 0;
          const totalRating =
            (Number(row.original.q1_Rating) || 0) +
            (Number(row.original.q2_Rating) || 0) +
            (Number(row.original.q3_Rating) || 0) +
            (Number(row.original.q4_Rating) || 0);

          const progress =
            totalQuarter > 0 ? (totalRating / totalQuarter) * 10 : 0;
          return (
            <Box sx={{ width: "100%" }}>
              <Typography>{progress.toFixed(2)}%</Typography>
            </Box>
          );
        },
      },
      ...quarterColumns,
    ],
    [activeCell, quarterColumns, hoveredCell]
  );
  return columns;
};
