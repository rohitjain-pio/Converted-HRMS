/* eslint-disable @typescript-eslint/no-explicit-any */

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { MainCardContainer } from '@/components/MainCard';
import { Box } from '@mui/material';

export default function AnalyticEcommerce({
  title,
  count,
  icon,
}: any) {
  return (
    <MainCardContainer
      contentSX={{ p: 2.25 }}
      sx={{
        padding: 0,
        background: 'linear-gradient(149deg, rgba(30, 117, 187, 1) 57%, rgba(39, 168, 224, 1) 100%);',
        filter: "drop-shadow(2.939px 4.045px 5px rgba(0,0,0,0.08))",
        height: "100px",
        borderRadius: "15px",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        ".MuiCardContent-root": {
          padding: '12px',
        },
        ".MuiCardContent-root:last-child": {
          paddingBottom: '12px'
        }
      }}
    >
      <Box
        sx={{
          borderRadius: "100%",
          opacity: "0.05",
          height: "210px",
          width: "200px",
          position: "absolute",
          right: "-88px",
          top: "-75px",
          backgroundColor: (theme)=> theme.palette.common.white
        }}
      ></Box>
      <Box
        sx={{
          borderRadius: "100%",
          opacity: "0.1",
          height: "250px",
          width: "250px",
          position: "absolute",
          right: "-63px",
          bottom: "-122px",
          backgroundColor: (theme)=> theme.palette.common.white
        }}
      ></Box>
      <Grid
        container
        sx={{ Padding: 0 }}
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <Stack spacing={0.5}>
            <Typography
              variant="h6"
              sx={{
                color: (theme) => theme.palette.common.white,
                fontSize: "20px",
                fontWeight: 500,
                fontFamily: "Roboto",
                textAlign: "center",
              }}
            >
              {title}
            </Typography>
            <Grid container alignItems="center">
              <Grid item>
                <Typography
                  variant="h4"
                  sx={{
                    color: (theme) => theme.palette.common.white,
                    fontSize: "32px",
                    fontWeight: 700,
                    fontFamily: "Roboto",
                    textAlign: "center",
                    filter: "dropShadow(4.114px 5.663px 5px rgba(0,0,0,0.24))",
                  }}
                >
                  {count}
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </Grid>
        <Grid item sx={{ color: (theme) => theme.palette.common.white }}>
          {icon}
        </Grid>
      </Grid>
    </MainCardContainer>
  );
}
