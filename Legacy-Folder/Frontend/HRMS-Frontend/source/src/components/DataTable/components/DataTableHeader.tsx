import { TableCell, TableHead, TableSortLabel } from "@mui/material";
import { DataTableHeaderProps } from "@/components/DataTable/types";
import { StyledTableHeadRow } from "@/components/DataTable/style";
import { useTheme } from "@mui/material/styles";

const DataTableHeader: React.FC<DataTableHeaderProps> = ({
  order,
  orderBy,
  onRequestSort,
  headerCells,
}) => {
  const theme = useTheme();
  return (
    <TableHead>
      <StyledTableHeadRow>
        {headerCells.map(({ accessor, label, enableSorting, width }) => {
          const isSorted = orderBy === accessor;

          return (
            <TableCell
              key={accessor}
              sortDirection={isSorted ? order : false}
              style={{
                whiteSpace: 'nowrap',
                width,
                textTransform: "inherit",
                color: theme.palette.primary.contrastText,
                background: "#1E75BB",
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

export default DataTableHeader;
