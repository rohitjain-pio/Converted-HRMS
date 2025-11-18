import { TableCell, TableHead, TableSortLabel } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataTableHeaderProps } from "@/components/DataTable/types";
import { StyledTableHeadRow } from "@/components/DataTable/style";

const EmployeeDataTableHeader: React.FC<DataTableHeaderProps> = ({
  order,
  orderBy,
  onRequestSort,
  headerCells,
}) => {
  const theme = useTheme();
  return (
    <TableHead>
      <StyledTableHeadRow>
        {headerCells.map(({ accessor, label, enableSorting, width }, index) => {
          const isSorted = orderBy === accessor;

          return (
            <TableCell
              key={accessor}
              sortDirection={isSorted ? order : false}
              style={{
                whiteSpace: 'nowrap',
                width,
                minWidth: width,
                textTransform: "inherit",
                color: theme.palette.primary.contrastText,
                background: "#1E75BB",
                ...(index < 3 && {
                  position: 'sticky',
                  left: index === 0 ? 0 : index === 1 ? '140px' : '350px',
                  zIndex: 1,

                })
              }}
            >
              <TableSortLabel
                active={isSorted}
                direction={isSorted ? order : "asc"}
                onClick={(event) => onRequestSort(event, accessor)}
                disabled={!enableSorting}
                sx={{
                  "& .MuiTableSortLabel-icon": {
                    color: "white !important",
                  },
                  "&.Mui-active": {
                    color: "white !important",
                  },
                  "&:hover": {
                    color: "white !important",
                  },
                  "&:active": {
                    color: "white !important",
                  },
                }}
              >
                {label}
              </TableSortLabel>
            </TableCell>
          );
        })}
      </StyledTableHeadRow>
    </TableHead>
  );
};

export default EmployeeDataTableHeader;