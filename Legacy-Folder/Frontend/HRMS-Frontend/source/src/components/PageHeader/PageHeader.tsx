import React from "react";
import {
  Box,
  // Box,
  Divider,
  Grid,
  SxProps,
  Typography,
  TypographyProps,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface PageHeaderProps extends TypographyProps {
  title: string;
  actionButton?: React.ReactNode;
  hideBorder?: boolean;
  containerStyles?: SxProps;
  children?: React.ReactNode;
  goBack?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  actionButton,
  hideBorder = false,
  containerStyles = {},
  sx = {},
  children,
  goBack = false,
  ...rest
}) => {
  const navigate = useNavigate();
  return (
    <>
      <Grid
        container
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          padding: "16px",
          ...containerStyles,
        }}
      >
        <Grid item xs={12} sm="auto">
          <Box sx={{ display: "flex", gap: 2 }}>
            {goBack && (
              <RoundActionIconButton
                onClick={() => navigate(-1)}
                colorType="info"
                label="Go Back"
                size="small"
                icon={<ArrowBackIcon />}
              />
            )}
            <Typography
              variant="h5"
              sx={{ alignSelf: "center", color: "#273A50", ...sx }}
              {...rest}
            >
              {title}
            </Typography>
          </Box>
        </Grid>
        <Grid item>{actionButton}</Grid>
      </Grid>
      {children}
      {!hideBorder && <Divider sx={{ borderBottomWidth: 2 }} />}
    </>
  );
};

export default PageHeader;
