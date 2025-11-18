/* eslint-disable @typescript-eslint/no-explicit-any */

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Logo from '@/components/logo';
import AuthCard from '@/pages/Login/AuthCard';

export default function AuthWrapper({ children }: any) {
  return (
    <Box
      className='bottom-header-icon'
      sx={{ minHeight: '100vh', backgroundColor: '#eef4fb' }}
    >
      <Grid container direction='column' justifyContent='flex-end'>
        <Grid item xs={12} sx={{ ml: 3, mt: 3 }}>
          <Logo />
        </Grid>
        <Grid item xs={12}>
          <Grid
            item
            xs={12}
            container
            justifyContent='center'
            alignItems='center'
            sx={{
              minHeight: {
                xs: 'calc(100vh - 210px)',
                sm: 'calc(100vh - 134px)',
                md: 'calc(100vh - 112px)',
              },
            }}
          >
            <Grid item>
              <AuthCard>{children}</AuthCard>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
