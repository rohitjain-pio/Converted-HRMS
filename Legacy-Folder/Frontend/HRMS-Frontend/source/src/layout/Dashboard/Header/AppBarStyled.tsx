/* eslint-disable @typescript-eslint/no-explicit-any */
// import PropTypes from 'prop-types';

// material-ui
import { styled } from '@mui/material/styles';
import AppBar, { AppBarProps } from '@mui/material/AppBar';

// project import
import { drawerWidth } from '@/config';

// ==============================|| HEADER - APP BAR STYLED ||============================== //
interface AppBarStyledProps extends AppBarProps {
  open: boolean;
}

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarStyledProps>(({ theme, open }: any) => ({
  zIndex: theme.zIndex.drawer + 1,
  left: 0,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(!open && {
    width: `calc(100%)`,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));


export default AppBarStyled;
