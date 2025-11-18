/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar, { AppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';

// project import
import AppBarStyled from '@/layout/Dashboard/Header/AppBarStyled';
import HeaderContent from '@/layout/Dashboard/Header/HeaderContent';

import { handlerDrawerOpen, useGetMenuMaster } from '@/api/menu';

// assets
import MenuFoldOutlined from '@ant-design/icons/MenuFoldOutlined';
import MenuUnfoldOutlined from '@ant-design/icons/MenuUnfoldOutlined';
import { Box, Stack } from '@mui/material';
import PioIcon from '@/assets/images/icons/pio-logo-dark.svg'

// ==============================|| MAIN LAYOUT - HEADER ||============================== //

export default function Header() {
  const theme: any = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { menuMaster }: { menuMaster: any } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  // header content
  const headerContent = useMemo(() => <HeaderContent />, []);

  const iconBackColor = 'grey.100';
  const iconBackColorOpen = 'grey.200';

  // common header
  const mainHeader = (
    <Toolbar>
      <Stack direction='row' alignItems='center' gap={4}>
        {!drawerOpen && <Box component='img' src={PioIcon} height={36} width={36} sx={{ml: {xs: '-4px', sm:'-12px'}}} />}
      <IconButton
        disableRipple
        aria-label='open drawer'
        onClick={() => handlerDrawerOpen(!drawerOpen)}
        edge='start'
        color='secondary'
        // variant='light'
        sx={{
          color: 'text.primary',
          bgcolor: drawerOpen ? iconBackColorOpen : iconBackColor,
        }}
      >
        {!drawerOpen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </IconButton>
      </Stack>
      {headerContent}
    </Toolbar>
  );

  // app-bar params
  const appBar: AppBarProps = {
    position: 'fixed',
    color: 'inherit',
    elevation: 0,
    sx: {
      borderBottom: `1px solid ${theme.palette.divider}`,
      boxShadow: theme?.customShadows?.z1,
    },
  };

  return (
    <>
      {!downLG ? (
        <AppBarStyled open={!!drawerOpen} {...appBar}>
          {mainHeader}
        </AppBarStyled>
      ) : (
        <AppBar {...appBar}>{mainHeader}</AppBar>
      )}
    </>
  );
}
