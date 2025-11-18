import { Box, Typography, useTheme } from "@mui/material";
import moment from "moment";

const ShowDateTime = ({ date }: { date: string }) => {
  const theme = useTheme();
  return (
    <Box>
      <Typography
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        color={theme.palette.primary.main}
      >
        <span style={{ fontSize: "52px", fontWeight: 800 }}>
          {moment(date).format("D")}
        </span>
        <span
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            fontWeight: 600,
          }}
        >
          <span>{moment(date).format("MMM")}</span>
          <span>{moment(date).format("YYYY")}</span>
        </span>
      </Typography>
      <Typography
        sx={{
          textAlign: "center",
          fontWeight: 800,
          color: theme.palette.primary.light,
        }}
      >
        {moment(date).format("LT")}
      </Typography>
    </Box>
  );
};

export default ShowDateTime;
