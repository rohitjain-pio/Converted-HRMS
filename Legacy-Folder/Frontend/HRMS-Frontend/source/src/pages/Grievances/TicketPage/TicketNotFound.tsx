import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom";
import SearchOffIcon from "@mui/icons-material/SearchOff";

const TicketNotFound = () => {
  return (
    <Box
      sx={{
        minHeight: "72vh",
        display: "grid",
        placeItems: "center",
        px: 2,
      }}
    >
      <Stack spacing={2} alignItems="center" textAlign="center" maxWidth={680}>
        <SearchOffIcon color="secondary" sx={{ fontSize: 72 }} />
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Ticket not found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The ticket you're looking for doesn't exist, may have been deleted, or
          you don't have access.
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 1 }}
        >
          <Button
            variant="contained"
            component={Link}
            to={"/grievance/my-grievance"}
          >
            Back to Tickets
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to={"/grievance/my-grievance/add-grievance"}
          >
            Create New Ticket
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TicketNotFound;
