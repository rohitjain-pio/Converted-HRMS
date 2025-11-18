import { forwardRef } from 'react';

// material-ui
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// header style
const headerSX = {
  p: 0,
  '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
interface TPropTypes {
  border?: boolean;
  boxShadow?: boolean;
  children?: React.ReactNode;
  subheader?: string | React.ReactNode;
  content?: boolean;
  contentSX?: object;
  darkTitle?: boolean;
  divider?: boolean;
  elevation?: number;
  secondary?: any;
  shadow?: string;
  sx?: object;
  title?: string | React.ReactNode;
  modal?: boolean;
  others?: any;
}

function MainCard(
  {
    border = true,
    boxShadow,
    children,
    content = true,
    contentSX = {},
    darkTitle,
    elevation,
    secondary,
    shadow,
    sx = {},
    title,
    ...others
  }: TPropTypes,
  ref: any
) {
  //eslint-disable @typescript-eslint/no-explicit-any
  const theme: any = useTheme();
  boxShadow = theme.palette.mode === 'dark' ? boxShadow || true : boxShadow;

  return (
    <Card
      elevation={elevation || 0}
      ref={ref}
      {...others}
      sx={{
        border: border ? '1px solid' : 'none',
        borderRadius: 2,
        borderColor:
          theme.palette.mode === 'dark'
            ? theme.palette.divider
            : theme.palette.grey.A800,
        boxShadow:
          boxShadow && (!border || theme.palette.mode === 'dark')
            ? shadow || theme.customShadows?.z1
            : 'inherit',
        ':hover': {
          boxShadow: boxShadow ? shadow || theme.customShadows?.z1 : 'inherit',
        },
        '& pre': {
          m: 0,
          // p: '16px !important',
          fontFamily: theme.typography.fontFamily,
          fontSize: '0.75rem',
        },
        ...sx,
      }}
    >
      {!darkTitle && title && (
        <CardHeader
          sx={headerSX}
          title={title}
          action={secondary}
          slotProps={{
            title: { variant: 'subtitle1' }
          }}
        />
      )}
      {darkTitle && title && (
        <CardHeader
          sx={headerSX}
          title={<Typography variant='h3'>{title}</Typography>}
          action={secondary}
        />
      )}
      {content && <CardContent sx={contentSX}>{children}</CardContent>}
      {!content && children}
    </Card>
  );
}

export const MainCardContainer = forwardRef(MainCard);
