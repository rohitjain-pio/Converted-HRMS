import React from "react";
import { Box, Typography } from "@mui/material";

interface NoDataFoundProps {
  message?: string;
}

const NoDataFound: React.FC<NoDataFoundProps> = ({
  message = "No Data Found",
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "85%",
      }}
    >
      <Typography variant="h6" color="textSecondary" align="center">
        {message}
      </Typography>
    </Box>
  );
};

export default NoDataFound;
