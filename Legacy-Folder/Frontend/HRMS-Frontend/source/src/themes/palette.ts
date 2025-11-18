/* eslint-disable @typescript-eslint/no-explicit-any */
// material-ui
import { createTheme } from "@mui/material/styles";

// third-party
import { presetPalettes } from "@ant-design/colors";

// project import
import ThemeOption from "@/themes/theme";

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

declare module "@mui/material/styles" {
  interface Palette {
    status: {
      wipPendingApproval: string;
      upcoming: string;
      completed: string;
    };
  }
  interface PaletteOptions {
    status: {
      wipPendingApproval: string;
      upcoming: string;
      completed: string;
    };
  }
}

export default function Palette(mode: any, presetColor: any) {
  const colors = presetPalettes;

  const greyPrimary: string[] = [
    "#ffffff",
    "#fafafa",
    "#f5f5f5",
    "#f0f0f0",
    "#d9d9d9",
    "#bfbfbf",
    "#8c8c8c",
    "#595959",
    "#262626",
    "#141414",
    "#000000",
  ];
  const greyAscent: string[] = ["#fafafa", "#bfbfbf", "#434343", "#1f1f1f"];
  const greyConstant: string[] = ["#fafafb", "#e6ebf1"];

  colors.grey = [...greyPrimary, ...greyAscent, ...greyConstant];

  const statusColors = {
    wipPendingApproval: "#FF9800",
    upcoming: "#2196F3",
    completed: "#4CAF50",
  };

  const paletteColor: any = ThemeOption({ ...colors, ...presetColor, ...mode });

  return createTheme({
    palette: {
      mode,
      common: {
        black: "#000",
        white: "#fff",
      },
      ...paletteColor,
      text: {
        primary: paletteColor.grey[700],
        secondary: paletteColor.grey[500],
        disabled: paletteColor.grey[400],
      },
      action: {
        disabled: paletteColor.grey[300],
      },
      divider: paletteColor.grey[200],
      background: {
        paper: paletteColor.grey[0],
        default: paletteColor.grey.A50,
      },
      status: statusColors,
    },
  });
}
