import {
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { Link } from "react-router-dom";
import DownloadIcon from "@mui/icons-material/Download";
import { EventDocumentType } from "@/services/Events";

type EventDetailBoxProps = {
  title: string;
  value: string | EventDocumentType[];
  borderColor?: string;
  isUrl?: boolean;
  isFileList?: boolean;
};

const EventDetailBox = ({
  title,
  value,
  borderColor = "",
  isUrl = false,
  isFileList = false,
}: EventDetailBoxProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        border: `2px solid ${borderColor || theme.palette.primary.light}`,
        borderRadius: "4px",
        padding: "12px",
        boxShadow: "0px 0px 8px -5px rgba(0,0,0, 90%)",
        justifyContent: "space-between",
        marginBottom: "16px",
        flexWrap: "wrap",
      }}
    >
      <Typography fontWeight={800}>{title}:</Typography>
      {!isUrl && !isFileList && typeof value === "string" && (
        <Typography fontWeight={800}>{value}</Typography>
      )}
      {isUrl && !isFileList && typeof value === "string" && (
        <Link
          to={value}
          style={{
            width: "100%",
            fontWeight: 800,
            color: theme.palette.primary.main,
            overflowWrap: "anywhere",
          }}
          target="_blank"
        >
          {value}
        </Link>
      )}
      {isFileList && typeof value !== "string" ? (
        <Stack width={"100%"}>
          {value.map((eventDocument) => (
            <Link
              key={eventDocument.id}
              to={eventDocument.fileName}
              target="_blank"
              download
            >
              <Stack
                direction="row"
                gap={1}
                borderRadius={0.5}
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(0 0 0 / 0.04)",
                  },
                }}
              >
                <Tooltip title={eventDocument.originalFileName}>
                  <Typography
                    flexGrow={1}
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    fontWeight={800}
                  >
                    {eventDocument.originalFileName}
                  </Typography>
                </Tooltip>
                <IconButton
                  color="primary"
                  sx={{ width: "24px", height: "24px" }}
                  disableRipple
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Link>
          ))}
        </Stack>
      ) : null}
    </Box>
  );
};

export default EventDetailBox;
