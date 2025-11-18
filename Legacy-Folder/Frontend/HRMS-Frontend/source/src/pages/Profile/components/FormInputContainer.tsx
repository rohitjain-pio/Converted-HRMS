import { Grid } from "@mui/material";

interface FormInputContainerProps {
  children: React.ReactNode;
  md?: number;
}

const FormInputContainer: React.FC<FormInputContainerProps> = ({
  children,
  md = 4
}) => {
  return (
    <Grid xs={12} md={md} item>
      {children}
    </Grid>
  );
};

export default FormInputContainer;
