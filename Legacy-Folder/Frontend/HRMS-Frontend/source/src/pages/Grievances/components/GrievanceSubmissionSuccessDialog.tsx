import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Link } from "react-router-dom";

type Props = {
  open: boolean;
  data: {
    grievanceId: number;
    ticketNo: string;
  };
};

const GrievanceSubmissionSuccessDialog = (props: Props) => {
  const {
    open,
    data: { grievanceId, ticketNo },
  } = props;

  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogContent sx={{ px: 3 }}>
        <Stack direction="row" sx={{ gap: 3, alignItems: "center", mb: 2.5 }}>
          <CheckCircleRoundedIcon sx={{ fontSize: "4rem" }} color="success" />
          <Typography variant="h3">Grievance Submitted Successfully</Typography>
        </Stack>
        <Typography sx={{ fontSize: "1.1rem" }} gutterBottom>
          Your grievance has been submitted successfully.
        </Typography>
        <Typography sx={{ fontSize: "1.1rem" }} gutterBottom>
          Ticket ID: <strong>{ticketNo}</strong>
        </Typography>
        <Typography sx={{ fontSize: "1.1rem" }}>
          A confirmation email has been sent to your registered email address
          with the details.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          component={Link}
          to={`/Grievance/tickets/${grievanceId}`}
          sx={{
            minWidth: "120px",
            fontFamily: "Roboto",
            fontWeight: 500,
          }}
          variant="contained"
        >
          View Details
        </Button>
        <Button
          component={Link}
          to={"/Grievance/My-Grievance"}
          sx={{
            minWidth: "120px",
            fontFamily: "Roboto",
            fontWeight: 500,
          }}
          variant="outlined"
          color="inherit"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GrievanceSubmissionSuccessDialog;
