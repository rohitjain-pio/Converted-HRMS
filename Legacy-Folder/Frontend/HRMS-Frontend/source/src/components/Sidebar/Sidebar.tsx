import {
  ExpandLess,
  ExpandMore,
  Settings,
  CalendarMonth,
  Dashboard,
  GroupAdd,
  Menu,
  TextSnippet,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Collapse,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store';

const drawerWidth = 240;

const sidebarColor = 'rgb(38 144 203)';
const whiteColor = '#fff';

interface Props {
  window?: () => Window;
  children?: React.ReactNode;
}

const sidebarObj = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    icon: <Dashboard />,
  },
  {
    path: '/dashboard1',
    title: 'Employees',
    icon: <GroupAdd />,
  },
  {
    path: '/dashboard2',
    title: 'Surveys',
    icon: <TextSnippet />,
  },
  {
    path: '/dashboard3',
    title: 'Events',
    icon: <CalendarMonth />,
  },
  {
    path: '/dashboard4',
    title: 'Company Policy',
    icon: <TextSnippet />,
  },
  {
    path: '/dashboard5',
    title: 'Settings',
    icon: <Settings />,
    subMenu: [
      {
        path: '/dashboard6',
        title: 'Access Management',
      },
      {
        path: '/dashboard7',
        title: 'Employee Group',
      },
    ],
  },
];

const ResponsiveDrawer = (props: Props) => {
  const { window } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [openSubMenuIndex, setOpenSubMenuIndex] = React.useState(-1);
  const [selectedTab, setSelectedTab] = React.useState('/dashboard');

  const { setIsLoggedIn } = useUserStore();

  const handleOpenSettings = (index: number, path: string) => {
    if (openSubMenuIndex !== index) {
      setOpenSubMenuIndex(index);
    } else {
      setOpenSubMenuIndex(-1);
    }
    setSelectedTab(path);
  };

  React.useEffect(() => {
    if (location.pathname) {
      setSelectedTab(location.pathname);
    }
  }, []);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  const drawer = (
    <>
      <Toolbar
        style={{
          backgroundColor: whiteColor,
        }}
      >
        <Typography variant='h6' noWrap component='div'>
          Programmers.io
        </Typography>
      </Toolbar>
      <Divider />
      <List style={{}}>
        {sidebarObj.map((item, index) => (
          <Link key={index} to={item.path}>
            <ListItem
              disablePadding
              onClick={() => handleOpenSettings(index, item.path)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: item.path === selectedTab ? sidebarColor : whiteColor,
                backgroundColor:
                  item.path === selectedTab ? whiteColor : sidebarColor,
              }}
            >
              <ListItemButton>
                <ListItemIcon
                  style={{
                    color:
                      item.path === selectedTab ? sidebarColor : whiteColor,
                    minWidth: '35px',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
              {item.subMenu && item.subMenu.length > 0 && (
                <>
                  {index === openSubMenuIndex ? <ExpandLess /> : <ExpandMore />}
                </>
              )}
            </ListItem>

            {item.subMenu && item.subMenu.length > 0 && (
              <Collapse
                in={index === openSubMenuIndex}
                timeout='auto'
                unmountOnExit
              >
                <List>
                  <ListItem
                    disablePadding
                    style={{
                      color: whiteColor,
                    }}
                  >
                    <ListItemIcon>
                      <Settings />
                    </ListItemIcon>
                    <ListItemText inset primary='Starred' />
                  </ListItem>
                </List>
              </Collapse>
            )}
          </Link>
        ))}
      </List>
    </>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position='fixed'
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: whiteColor,
          color: '#000',
        }}
      >
        <Toolbar
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Box style={{ display: 'flex' }}>
            <IconButton
              color='inherit'
              aria-label='open drawer'
              edge='start'
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <Menu />
            </IconButton>
          </Box>
          <Button
            sx={{ flexDirection: 'row' }}
            color='inherit'
            onClick={logoutUser}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Box
        component='nav'
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label='mailbox folders'
      >
        <Drawer
          container={container}
          variant='temporary'
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              height: '100%',
              backgroundColor: sidebarColor,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant='permanent'
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              height: '100%',
              backgroundColor: sidebarColor,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {props.children}
      </Box>
    </Box>
  );
};

export default ResponsiveDrawer;
