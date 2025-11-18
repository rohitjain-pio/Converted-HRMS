import { Outlet } from 'react-router-dom';
import '@/App.css';
import { ResponsiveDrawer } from '@/components';
import { useUserStore } from '@/store';

const App: React.FC = () => {
  const { isLoggedIn } = useUserStore();
  return isLoggedIn ? <ResponsiveDrawer children={<Outlet />} /> : <Outlet />;
};

export default App;
