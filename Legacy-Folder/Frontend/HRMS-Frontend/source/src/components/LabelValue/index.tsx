import { Typography, Box } from "@mui/material";

interface LabelValueProps {
  label: string;
  value: string | undefined;
}

function LabelValue({ label, value }: LabelValueProps) {
  return (
    <Box>
      <Typography variant="body1" color="#273a50" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="body1" color="#4b535b">
        {value}
      </Typography>
    </Box>
  );
}

export default LabelValue;
