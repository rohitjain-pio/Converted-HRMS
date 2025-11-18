import React, { useState } from "react";
import {
  Box,
  FormLabel,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { MRT_PaginationState } from "material-react-table";

interface TableBottomToolbarProps {
  totalRecords: number;
  pagination: MRT_PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<MRT_PaginationState>>;
}

export const TableBottomToolbar: React.FC<TableBottomToolbarProps> = ({
  totalRecords,
  pagination,
  setPagination,
}) => {
    const [goToPage,setGoToPage]=useState("")
    const [pageError,setPageError]=useState("")
  const handleGoToPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if ((value.length > 0 && Number(value) > 9999) || value.length > 4) {
      value = value.slice(0, 4);
      setPageError("Cannot enter more than 9999");
    } else {
      setPageError("");
    }
    setGoToPage(value);
  };

  const handleGoToPageClick = () => {
    const maxPage = Math.ceil(totalRecords / pagination.pageSize);
    const pageNumber = Number.parseInt(goToPage);
    
    if (pageNumber >= 1 && pageNumber <= maxPage) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: pageNumber - 1,
      }));
      setPageError("");
    } else {
      setPageError(`Page ${pageNumber} does not exist.`);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "1rem",
        p: "1rem",
      }}
    >
      <FormLabel sx={{ color: "#595959" }}>Go To Page</FormLabel>
      <TextField
        value={goToPage}
        onChange={handleGoToPageChange}
        size="small"
        sx={{
          width: "5rem",
          fontSize: "0.875rem",
          lineHeight: "1.4375rem",
          "& .MuiInputBase-root": {
            pr: 0.5,
          },
        }}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end" sx={{ ml: 0 }}>
                <IconButton
                  size="small"
                  color="primary"
                  disabled={goToPage.length === 0}
                  onClick={handleGoToPageClick}
                >
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
          htmlInput: {
            inputMode: "decimal",
          },
        }}
      />
      {pageError && (
        <Typography variant="body2" color="error" sx={{ minWidth: "150px" }}>
          {pageError}
        </Typography>
      )}
    </Box>
  );
};

 