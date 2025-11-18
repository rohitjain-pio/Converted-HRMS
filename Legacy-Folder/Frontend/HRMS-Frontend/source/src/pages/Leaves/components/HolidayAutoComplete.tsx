import {
  Autocomplete,
  CircularProgress,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import useAsync from "@/hooks/useAsync";

import methods from "@/utils";
import { useState } from "react";
import { useFieldError } from "@/hooks/useFieldError";
import { Controller, useFormContext } from "react-hook-form";


import { formatDate } from "@/utils/formatDate";
import { GetHolidayResponse, getPersonalizedHolidayList, IHoliday } from "@/services/EmployeeLeave";
import { useUserStore } from "@/store";

type HolidayAutocompleteProps = {
  label: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

const HolidayAutoComplete = (props: HolidayAutocompleteProps) => {
  const { label, name = "holiday", required, placeholder, disabled } = props;
  const error = useFieldError(name);
  const { control } = useFormContext();
  const [holidayList, setHolidayList] = useState<IHoliday[]>([]);
  const { userData } = useUserStore();
  const { isLoading: isFetchingHoliday } = useAsync<GetHolidayResponse>({
    requestFn: async (): Promise<GetHolidayResponse> => {
      return await getPersonalizedHolidayList(Number(userData.userId));
    },
    onSuccess: ({ data }) => {
      setHolidayList(data.result.india);
    },
    autoExecute: true,
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  return (
    <FormControl
      disabled={disabled}
      fullWidth
      sx={{ minWidth: 150, width: "100%" }}
      error={error.isError}
    >
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange } }) => (
          <>
            <Autocomplete
              disabled={disabled}
              options={holidayList}
              getOptionLabel={(option) =>
                `${option.remarks} (${formatDate(option.date)})`
              }
              value={
                holidayList.find(
                  (holiday) => `${holiday.remarks},${holiday.date}` === value
                ) ?? null
              }
              onChange={(_event, value) => {
                onChange(
                  value ? `${value.remarks.toString()},${value.date}` : ""
                );
              }}
              ListboxProps={{
                style: {
                  maxHeight: 4 * 48,
                  overflowY: "auto",
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ width: "100%" }}
                  error={error.isError}
                  placeholder={placeholder}
                  label={required ? `${label}*` : label}
                  slotProps={{
                    input: {
                      style: { height: 41.13 },
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isFetchingHoliday ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
            {error.isError && (
              <FormHelperText error sx={{ ml: 0 }}>
                {error.message}
              </FormHelperText>
            )}
          </>
        )}
      />
    </FormControl>
  );
};

export default HolidayAutoComplete;
