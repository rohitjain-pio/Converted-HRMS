/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box } from '@mui/material';
import logoSVG from '@/assets/images/icons/programmers-io.svg';

const Logo = () => {
  return <Box component='img' src={logoSVG} height={'30px'} width='90%' margin={'auto !important'} />;
};

export default Logo;
