import { Grid } from '@mui/material';
import { DashboardCard } from '@/components';
import { GroupRemove, PostAdd, Settings } from '@mui/icons-material';

interface item {
  icon: React.ReactElement;
  title: string;
  value: string;
  color: string;
}

const topCard: item[] = [
  {
    icon: <Settings sx={{ fontSize: 60 }} />,
    title: 'Total Active Employee',
    value: '700',
    color: '#f896a7',
  },
  {
    icon: <PostAdd sx={{ fontSize: 60 }} />,
    title: 'New Employee Enrolled',
    value: '10',
    color: '#d486d4',
  },
  {
    icon: <GroupRemove sx={{ fontSize: 60 }} />,
    title: 'Employee Exit Organization',
    value: '2',
    color: '#f1b885',
  },
];

const Dashboard = () => {
  return (
    <div>
      Dashboard
      <Grid container spacing={2}>
        {topCard.map((obj, index) => (
          <Grid key={index} item xs={6} md={4} sm={4}>
            <DashboardCard item={obj} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default Dashboard;
