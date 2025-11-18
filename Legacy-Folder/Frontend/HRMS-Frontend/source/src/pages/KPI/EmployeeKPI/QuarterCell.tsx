import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { CellAction } from "@/pages/KPI/KpiDetails";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
const QuarterCell = (props: {
  rating: number | null;
  hovered: boolean;
  onAction?: () => void;
  action?: CellAction | null;
  disabled: boolean;
}) => {
  const { rating, hovered, onAction, action, disabled } = props;

  const showAction = !disabled && hovered && !!action;

  const renderContent = () => {
    if (disabled) return <Typography color="text.secondary">N/A</Typography>;
    if (rating === null)
      return <Typography color="text.secondary">Add</Typography>;
    return <Typography>{rating}</Typography>;
  };

  const renderAction = () => {
    if (!action) return null;
    let tooltipTitle = "";
    let Icon = null;

    switch (action) {
      case "add":
        tooltipTitle = "Add Rating";
        Icon = EditIcon;
        break;

      case "edit":
        tooltipTitle = "Edit Rating";
        Icon = EditIcon;
        break;

      case "view":
        tooltipTitle = "View Rating";
        Icon = VisibilityIcon;
        break;
    }

    return (
      <Tooltip title={tooltipTitle}>
        <IconButton size="small" color="primary" onClick={onAction}>
          {Icon && <Icon fontSize="small" />}
        </IconButton>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      {renderContent()}
      {showAction ? (
        renderAction()
      ) : (
        // Render a placeholder so the cell layout doesn't jump
        <Box sx={{ width: 30, height: 30 }} />
      )}
    </Box>
  );
};
export default QuarterCell