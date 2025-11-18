import { Box, Button, Container, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store";
import error401 from "@/assets/images/icons/error-401-unauthorized.png";

export default function Unauthorized() {
  const { isLoggedIn } = useUserStore();
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="md">
        <Grid container spacing={2}>
          <Grid xs={6}>
            <Typography variant="h1">401</Typography>
            <Typography variant="h6">
              You don't have permission to access this page
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ marginTop: 2 }}
              onClick={() => navigate(isLoggedIn ? "/dashboard" : "/")}
            >
              Go to Home
            </Button>
          </Grid>
          <Grid xs={6}>
            <img src={error401} alt="" width={500} height={250} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
