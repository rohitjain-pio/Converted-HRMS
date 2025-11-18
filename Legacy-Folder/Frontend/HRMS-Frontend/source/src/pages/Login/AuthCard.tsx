/* eslint-disable @typescript-eslint/no-explicit-any */

// material-ui
import Box from '@mui/material/Box';

// project import
import { MainCardContainer } from '@/components/MainCard';

// ==============================|| AUTHENTICATION - CARD WRAPPER ||============================== //

export default function AuthCard({ children, ...other }: any) {
  return (
    <MainCardContainer
      sx={{
        maxWidth: { xs: 700, lg: 726 },
        margin: { xs: 2, md: 3 },
        '& > *': { flexGrow: 1, flexBasis: '50%' },
      }}
      content={false}
      {...other}
      border={false}
      boxShadow
      shadow={(theme: any) => theme?.customShadows?.z1}
      style={{
        borderRadius: '16px 16px 16px 16px',
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3, md: 4, xl: 5 } }}>{children}</Box>
    </MainCardContainer>
  );
}
