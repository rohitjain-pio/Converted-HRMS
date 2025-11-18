import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  ListItemIcon,
  Typography,
} from '@mui/material';

interface TItem {
  item: {
    icon: React.ReactElement;
    title: string;
    value: string;
    color: string;
  };
}

const DashboardCard = ({ item }: TItem) => {
  return (
    <Box my={2}>
      <Card
        sx={{
          '& .MuiCardContent-root': {
            padding: 0,
          },
        }}
      >
        <CardActionArea>
          <CardContent
            style={{ display: 'flex', maxHeight: 250, minHeight: 120 }}
          >
            <ListItemIcon
              sx={{
                backgroundColor: item.color,
                color: '#fff',
                width: 150,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <Box
              sx={{
                marginLeft: '10px',
              }}
            >
              <Typography variant='h6'>
                <b>{item.title}</b>
              </Typography>
              <Typography
                variant='h3'
                sx={{
                  justifyContent: 'center',
                  display: 'flex',
                }}
              >
                <b>{item.value}</b>
              </Typography>
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    </Box>
  );
};

export default DashboardCard;
