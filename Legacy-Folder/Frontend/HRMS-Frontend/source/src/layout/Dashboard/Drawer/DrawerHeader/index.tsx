import PropTypes from 'prop-types';

// project import
import DrawerHeaderStyled from '@/layout/Dashboard/Drawer/DrawerHeader/DrawerHeaderStyled';
import Logo from '@/components/logo';

// ==============================|| DRAWER HEADER ||============================== //

export default function DrawerHeader({ open }: { open: boolean }) {
  return (
    <DrawerHeaderStyled>
      <Logo sx={{ width: open ? 'auto' : 35, height: 35 }} />
    </DrawerHeaderStyled>
  );
}

DrawerHeader.propTypes = { open: PropTypes.bool };
