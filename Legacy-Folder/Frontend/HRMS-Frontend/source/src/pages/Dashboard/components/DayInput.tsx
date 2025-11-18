import { Grid, TextField } from "@mui/material";
import RoundActionIconButton from "@/components/RoundActionIconButton/RoundActionIconButton";
import SearchIcon from "@mui/icons-material/Search";
import { ChangeEvent, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";

const MIN_DAYS = 1;
const MAX_DAYS = 730;
const DIGITS_REGEX = /^\d*$/;

type DayInputProps = {
  onSearch: (value: number) => void;
  onClose: () => void;
};

const DayInput = (props: DayInputProps) => {
  const { onSearch, onClose } = props;
  const [inputValue, setInputValue] = useState("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;

    if (!DIGITS_REGEX.test(value)) {
      return;
    }

    if (value === "") {
      setInputValue("");
      return;
    }

    const numericValue = Number(value);
    if (numericValue >= MIN_DAYS && numericValue <= MAX_DAYS) {
      setInputValue(value);
    }
  };

  const handleSearch = () => {
    if (inputValue !== "") {
      onSearch(Number(inputValue));
    }
  };

  return (
    <Grid
      container
      sx={{
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Grid item xs={12} sm="auto">
        <TextField
          name="pastDays"
          label="Past Days"
          value={inputValue}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} sm="auto">
        <Grid container gap={2}>
          <RoundActionIconButton
            label="Search"
            fabSx={{
              width: "2rem",
              height: "2rem",
              minHeight: "2rem",
              "& svg": {
                fontSize: "1rem",
              },
            }}
            icon={<SearchIcon />}
            onClick={handleSearch}
          />
          <RoundActionIconButton
            label="Close"
            fabSx={{
              width: "2rem",
              height: "2rem",
              minHeight: "2rem",
              "& svg": {
                fontSize: "1rem",
              },
            }}
            colorType="error"
            icon={<CloseIcon />}
            onClick={onClose}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DayInput;
