import { SetStateAction } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Box, Typography } from "@mui/material";
import moment from "moment";


type CustomDatePickerProps = {
  open: boolean;
  error: boolean;
  onClose: () => void;
  onConfirm: () => void;
  startDate: moment.Moment | null;
  endDate: moment.Moment | null;
  changeStartDate: (value: SetStateAction<moment.Moment | null>) => void;
  changeEndDate: (value: SetStateAction<moment.Moment | null>) => void;

};

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  open,
  onClose,
  onConfirm,
  error,
  startDate,
  endDate,
  changeStartDate,
  changeEndDate
}) => {

  const content = (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box>
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => changeStartDate(newValue)}
            maxDate={moment()}
            format="MMM Do, YYYY"
            slotProps={{
              textField: {
                onKeyDown: (event)=> event.preventDefault()
              }
            }}
          />
          {error && startDate === null && (
            <Typography color="error">Start date cannot be empty</Typography>
          )}
        </Box>
        <Box>
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => changeEndDate(newValue)}
            minDate={moment(startDate)}
            maxDate={moment()}
            format="MMM Do, YYYY"
            slotProps={{
              textField: {
                onKeyDown: (event)=> event.preventDefault()
              }
            }}
          />
          {error && endDate === null && (
            <Typography color="error">End date cannot be empty</Typography>
          )}
        </Box>
      </Box>
    </LocalizationProvider>
  );

  return (
    <>
      <ConfirmationDialog
        title="Date Range"
        content={content}
        open={open}
        onClose={onClose}
        onConfirm={() => onConfirm()}
        confirmBtnColor="primary"
      />
    </>
  );
};

export default CustomDatePicker;
