import { Backdrop, CircularProgress } from "@mui/material";

const GlobalLoader = ({ loading }: { loading: boolean }) => {
  return (
    <Backdrop
      sx={(theme) => ({ zIndex: theme.zIndex.modal + 1 })}
      open={loading}
    >
      <CircularProgress
        sx={(theme) => ({ color: theme.palette.common.white })}
      />
    </Backdrop>
  );
};

export default GlobalLoader;
