import Grid from '@mui/material/Grid';
import SSOLogin from '@/pages/Login/auth-forms/SSOLogin';

export default function AuthLogin() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <SSOLogin />
      </Grid>
    </Grid>
  );
}
