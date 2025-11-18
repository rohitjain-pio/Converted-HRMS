import React, { useState } from "react";
import {
  Box,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
} from "@mui/material";
import DataTableHeader from "@/components/DataTable/components/DataTableHeader";
import { DataTableProps, Order } from "@/components/DataTable/types";
import { StyledTableRow } from "@/components/DataTable/style";
import { TruncatedText } from "@/components/TruncatedText/TruncatedText";

const DataTable: React.FC<DataTableProps> = ({
  data,
  headerCells,
  setSortColumnName,
  setSortDirection,
  setStartIndex,
  setPageSize,
  pageSize = 10,
  startIndex = 1,
  totalRecords = 0,
  hidePagination = false,
}) => {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<string>("");
  const isDataExists = !!data?.length;

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: string
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setSortColumnName?.(property);
    setSortDirection?.(isAsc ? "desc" : "asc");
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    if (setStartIndex) {
      setStartIndex(newPage + 1);
    }
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (setStartIndex && setPageSize) {
      setStartIndex(1);
      setPageSize(parseInt(event.target.value, 10));
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TableContainer>
        <Table sx={{ minWidth: 750 }} size="medium">
          <DataTableHeader
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            headerCells={headerCells}
          />
          <TableBody>
            {isDataExists ? (
              <>
                {data.map((row, index) => (
                  <StyledTableRow hover key={row.id}>
                    {headerCells.map((headerCell) => (
                      <TableCell
                        key={headerCell.accessor}
                        style={{
                          width: headerCell.width,
                          whiteSpace: 'nowrap',
                          padding: "5px 10px",
                        }}
                      >
                        {headerCell.renderColumn ? (
                          headerCell.renderColumn(row, index)
                        ) : (
                          <TruncatedText
                            text={row[headerCell.accessor]}
                            tooltipTitle={row[headerCell.accessor]}
                            maxLength={headerCell.maxLength || 20}
                          />
                        )}
                      </TableCell>
                    ))}
                  </StyledTableRow>
                ))}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={headerCells.length}
                  sx={{
                    textAlign: "center",
                    paddingY: "25px",
                  }}
                >
                  No Data Found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {isDataExists && !hidePagination && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalRecords}
          rowsPerPage={pageSize}
          page={startIndex - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Box>
  );
};

export default DataTable;
