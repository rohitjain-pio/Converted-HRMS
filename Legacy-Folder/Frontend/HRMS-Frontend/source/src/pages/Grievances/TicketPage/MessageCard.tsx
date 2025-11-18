import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ProfilePicture from "@/pages/Profile/components/ProfilePicture";
import { formatUtcToLocal } from "@/utils/date";
import { GrievanceStatus } from "@/utils/constants";
import GrievanceStatusChip from "@/pages/Grievances/components/GrievanceStatusChip";
import SanitizedHtml from "@/components/SanitizedHtml/SanitizedHtml";
import { Box, Chip, Tooltip, useTheme } from "@mui/material";
import { getCardTone } from "@/pages/Grievances/TicketPage/helpers";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ViewDocument from "@/pages/ExitEmployee/components/ViewDocument";

export type MessageOrigin = "requester" | "owner";

type MessageCardProps = Readonly<{
  actor: { name: string; email?: string; avatarUrl?: string };
  timestamp?: string; // ISO UTC
  bodyHtml: string;
  status?: GrievanceStatus;
  origin: MessageOrigin;
  toneBy?: "origin" | "status" | "none";
  attachment?: {
    name: string;
    url: string;
  };
}>;

const MessageCard = (props: MessageCardProps) => {
  const {
    actor,
    bodyHtml,
    timestamp,
    status,
    origin,
    toneBy = "origin",
    attachment,
  } = props;
  const theme = useTheme();

  const ts = timestamp ? formatUtcToLocal(timestamp) : null;

  const { bgColor, bgColorOnHover, borderColor, railColor } = getCardTone(
    theme,
    origin,
    status,
    toneBy
  );

  return (
    <Card
      variant="outlined"
      component="article"
      sx={{
        mb: 2,
        borderRadius: 2,
        position: "relative",
        bgcolor: bgColor,
        borderColor,

        // left accent rail
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: railColor,
          borderTopLeftRadius: 8,
          borderBottomLeftRadius: 8,
          height: "100%",
        },

        "&:hover": {
          bgcolor: bgColorOnHover,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="flex-start" useFlexGap>
          <Box
            sx={{
              p: 0.5,
              borderRadius: "50%",
              border: `2px solid ${railColor}`,
              lineHeight: 0,
            }}
          >
            <ProfilePicture
              userName={actor.name}
              size={40}
              profileImageUrl={actor.avatarUrl}
            />
          </Box>
          <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }} useFlexGap>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 0.5, sm: 1 }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              useFlexGap
            >
              <Stack spacing={0.25} sx={{ minWidth: 0 }} useFlexGap>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="baseline"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Typography sx={{ fontWeight: 600 }}>{actor.name}</Typography>
                  {actor.email && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
                    >
                      {actor.email}
                    </Typography>
                  )}
                  {origin === "requester" && (
                    <Chip
                      size="small"
                      label="Requester"
                      color="info"
                      tabIndex={-1}
                      sx={{
                        height: 20,
                        borderRadius: "1rem",
                        fontWeight: 500,
                        "& .MuiChip-label": {
                          whiteSpace: "nowrap",
                          maxWidth: 160,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        },
                      }}
                    />
                  )}
                </Stack>
                {ts ? (
                  <Typography variant="caption" color="text.secondary">
                    {ts}
                  </Typography>
                ) : null}
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                {status ? (
                  <GrievanceStatusChip
                    status={status}
                    chipProps={{ size: "small" }}
                  />
                ) : null}
              </Stack>
            </Stack>

            <Divider />

            <SanitizedHtml
              htmlString={bodyHtml}
              sx={{
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                mt: 1,
              }}
            />

            {!!attachment && (
              <Box sx={{ pt: 4 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Attachment
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  sx={(theme) => ({
                    p: 1,
                    minHeight: 40,
                    maxWidth: { xs: "100%", sm: 500 },
                    borderRadius: "8px",
                    border: `1px solid ${theme.palette.grey[300]}`,
                    bgcolor: "background.paper",
                  })}
                >
                  <AttachFileIcon color="action" />
                  <Box
                    sx={{
                      flexGrow: 1,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      px: 1,
                    }}
                  >
                    <Tooltip title={attachment.name}>
                      <Typography
                        sx={{
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                        }}
                      >
                        {attachment.name}
                      </Typography>
                    </Tooltip>
                  </Box>
                  <ViewDocument containerType={1} filename={attachment.url} />
                </Stack>
              </Box>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MessageCard;
