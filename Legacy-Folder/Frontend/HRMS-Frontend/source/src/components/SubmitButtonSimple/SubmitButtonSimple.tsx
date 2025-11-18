import { Button, ButtonProps } from "@mui/material";

const SubmitButtonSimple: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <Button
      variant="contained"
      type="submit"
      sx={{ minWidth: "120px", justifyContent: "space-evenly" }}
      {...rest}
    >
      {children || "Submit"}
    </Button>
  );
};

export default SubmitButtonSimple;
