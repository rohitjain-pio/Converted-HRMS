import { useRef } from "react";
import { Tooltip, Typography } from "@mui/material";

interface TruncatedTextProps {
  text: string | undefined | number;
  tooltipTitle: string | undefined | number;
  maxLength: number;
}

export const TruncatedText = ({
  text,
  maxLength,
  tooltipTitle,
}: TruncatedTextProps) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const value = text?.toString() || "";
  const isTruncated = value.length > maxLength;

  return (
    <Tooltip title={isTruncated ? tooltipTitle : ""} placement="top" arrow>
      <Typography ref={textRef}>
        {value.substring(0, maxLength)}
        {isTruncated && `...`}
      </Typography>
    </Tooltip>
  );
};
