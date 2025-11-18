import { useState } from "react";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import {
  Dialog,
  DialogContent,
  Tooltip,
  Typography,
  IconButton,
  Box,
  Stack,
  styled,
} from "@mui/material";
import indiaFlag from "@/assets/images/icons/india.svg";
import usFlag from "@/assets/images/icons/american.svg";
import "@/pages/Dashboard/components/DashboardTile.css";
import PageHeader from "@/components/PageHeader/PageHeader";
import CloseIcon from "@mui/icons-material/Close";
import HolidayCalendar from "@/pages/Dashboard/components/HolidayCalendar";
import { IHoliday } from "@/services/Dashboard";
import { Flag } from "@/pages/Dashboard/components/useDashboardData";

interface DashboardTileProps {
  title: string;
  value: React.ReactNode;
  isLoading: boolean;
  holidays: IHoliday[];
  flag: Flag;
  changeFlag: (flag: Flag) => void;
  background: number;
}

const ScrollableBoxContainer = styled(Box)(() => ({
  border: "1px solid #c7d9eb",
  borderRadius: "15px",
  padding: "10px 15px",
  margin: 0,
  textAlign: "left",
  transition: "transform 0.2s",
  filter: "drop-shadow(2.939px 4.045px 5px rgba(0,0,0,0.08))",
  height: "250px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  backgroundColor: "#F4FAFD",
}));

const DashboardTile: React.FC<DashboardTileProps> = ({
  title,
  value,
  isLoading,
  holidays,
  flag,
  changeFlag,
}) => {
  const [openHolidayCalendar, setOpenHolidayCalendar] =
    useState<boolean>(false);

  const flagImageMap = {
    India: indiaFlag,
    USA: usFlag,
  };

  const renderFlags = (showViewMore = false) => (
    <div className="flag-container">
      {Object.entries(flagImageMap).map(([flagName, imgSrc]) => (
        <Tooltip key={flagName} title={flagName} arrow>
          <div
            key={flagName}
            onClick={() => changeFlag(flagName as Flag)}
            className={`flag-wrapper ${flag === flagName ? "selected" : ""}`}
          >
            <img className="flag-icon" src={imgSrc} alt={`Flag ${flagName}`} />
          </div>
        </Tooltip>
      ))}
      {showViewMore && (
        <Tooltip
          title="View More"
          sx={{ cursor: "pointer" }}
          onClick={() => setOpenHolidayCalendar(true)}
          arrow
        >
          <ArrowOutwardIcon color="primary" />
        </Tooltip>
      )}
    </div>
  );

  return (
    <>
      <ScrollableBoxContainer>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography sx={{ color: "#1E75BB" }} variant="h4">
            {title}
          </Typography>
          {title === "Upcoming Holidays" && renderFlags(true)}
        </Stack>
        <Box sx={{ flex: 1, overflowY: "auto" }}>{value}</Box>
      </ScrollableBoxContainer>
      {openHolidayCalendar ? (
        <Dialog open={openHolidayCalendar} maxWidth="md" fullWidth>
          <>
            <PageHeader variant="h4" title="Holiday Calendar" />
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => {
                setOpenHolidayCalendar(false);
              }}
              aria-label="close"
              style={{ position: "absolute", right: 20, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </>

          <DialogContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 3,
              }}
            >
              {renderFlags()}
            </Box>
            <Typography sx={{ textAlign: "center" }}>
              <HolidayCalendar isLoading={isLoading} holidays={holidays} />
            </Typography>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
};

export default DashboardTile;
