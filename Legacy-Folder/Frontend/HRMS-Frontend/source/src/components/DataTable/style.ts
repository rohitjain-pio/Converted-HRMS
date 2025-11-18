import { TableRow } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.common.white,
  },
  "&:nth-of-type(even)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const StyledTableHeadRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: theme.palette.action.hover,
}));
