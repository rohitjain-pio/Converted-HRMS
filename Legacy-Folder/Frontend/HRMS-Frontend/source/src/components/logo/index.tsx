/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import { ButtonBase } from '@mui/material';
import Stack from '@mui/material/Stack';
import config from '@/config';
import Logo from '@/components/logo/LogoMain';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = ({ sx, to }: any) => {
  return (
    <ButtonBase
      disableRipple
      component={Link}
      to={!to ? config.defaultPath : to}
      sx={sx}
    >
      <Stack direction='row' spacing={1} alignItems='center'>
        <Logo />
      </Stack>
    </ButtonBase>
  );
};

export default LogoSection;
