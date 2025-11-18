import { forwardRef, ForwardRefExoticComponent } from "react";
import { Link } from "react-router-dom";
import { Link as MaterialLink } from "@mui/material";

interface RouterMaterialLinkProps {
  to: string;
  children: React.ReactNode;
}

const RouterMaterialLink: ForwardRefExoticComponent<RouterMaterialLinkProps> =
  forwardRef((props) => (
    <MaterialLink
      color="primary"
      underline="none"
      component={Link}
      {...props}
    />
  ));

export default RouterMaterialLink;
