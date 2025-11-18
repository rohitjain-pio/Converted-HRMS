import * as React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useLocation, useNavigate } from "react-router-dom";
import { Box } from "@mui/material";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getBreadcrumbSegments(pathname: string, state: any) {
  let segments = pathname
    .split("/")
    .filter((path) => path && isNaN(+path) && path !== "profile");

  if (segments[0] === "employees" && state?.fromRolesPage) {
    segments = ["roles", ...segments];
  }

  return segments;
}

const BreadCrumbs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathName = getBreadcrumbSegments(location.pathname, location.state);

  function handleClick(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    navigateTo: string
  ) {
    event.preventDefault();
    navigate(navigateTo);
  }

  function getBreadcrumbText(value: string) {
    return value
      .split("-")
      .map((str) => `${str.charAt(0).toUpperCase()}${str.slice(1)}`)
      .join(" ");
  }

  const breadcrumbs = [
    <Link
      underline="hover"
      key="1"
      sx={(theme) => ({ color: theme.palette.primary.main })}
      href="/"
      onClick={(event) => handleClick(event, "/dashboard")}
    >
      Dashboard
    </Link>,
    pathName.map((value: string, index: number) => {
      const to: string = `/${pathName.slice(0, index + 1).join("/")}`;
      const isLast = pathName.length - 1 === index;
      return (
        <Box>
          {isLast ||
          value === "settings" ||
          value === "developer" ||
          value === "attendance" ||
          value === "employees"||
          value==="leave" ||
          value === "KPI"||
          value==="Grievance"||
          value=="Support" ? (
            <Box
              component={"span"}
              key={index}
              sx={{
                color: (theme) => theme.palette.grey["900"],
              }}
            >
              {getBreadcrumbText(value)}
            </Box>
          ) : (
            <>
              {value === "employment-details" ? (
                <Link
                  underline="hover"
                  key={index}
                  sx={(theme) => ({ color: theme.palette.primary.main })}
                  href={"/employees/employee-list"}
                >
                  Employees
                </Link>
              ) : (
                <Link
                  underline="hover"
                  key={index}
                  sx={(theme) => ({ color: theme.palette.primary.main })}
                  href={to}
                >
                  {getBreadcrumbText(value)}
                </Link>
              )}
            </>
          )}
        </Box>
      );
    }),
  ];

  return (
    <Stack spacing={2}>
      <Box pt={0.5} pb={1.25}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          {breadcrumbs}
        </Breadcrumbs>
      </Box>
    </Stack>
  );
};

export default BreadCrumbs;
