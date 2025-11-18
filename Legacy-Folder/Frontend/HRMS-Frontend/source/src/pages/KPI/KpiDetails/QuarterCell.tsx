import { Typography, Tooltip, IconButton, Box } from "@mui/material";
import { CellAction } from "@/pages/KPI//EmployeeKPI";
import VisibilityIcon from "@mui/icons-material/Visibility";

 const QuarterCell = (props: {
      rating: number | null;
      hovered: boolean;
      onAction?: () => void;
      action?: CellAction | null;
      disabled: boolean;
      status: boolean | null;
    }) => {
      const { rating, hovered, onAction, action, disabled, status } = props;

      const showAction = !disabled && hovered && !!action && status !== null;

      const renderContent = () => {
        if (disabled) return <Typography color="text.secondary">N/A</Typography>;
        if (rating === null )
          return <Typography color="text.secondary">Pending</Typography>;
        return <Typography>{rating}</Typography>;
      };

      const renderAction = () => {
        if (!action || status === null) return null;
        let tooltipTitle = "";
        let Icon = null;
        switch (action) {
          case "view":
            tooltipTitle = "View Rating";
            Icon = VisibilityIcon;
            break;

          default:
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