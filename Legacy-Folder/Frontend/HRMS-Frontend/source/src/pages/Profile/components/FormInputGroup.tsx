import { Grid, GridProps } from "@mui/material";

interface FormInputGroupProps extends GridProps {
  children: React.ReactNode;
}

const FormInputGroup: React.FC<FormInputGroupProps> = ({
  children,
  ...rest
}) => {
  return (
    <Grid container spacing={2} {...rest}>
      {children}
    </Grid>
  );
};

export default FormInputGroup;
