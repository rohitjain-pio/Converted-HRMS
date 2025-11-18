import {
  Autocomplete,
  CircularProgress,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { useEffect, useState } from "react";
import { useFieldError } from "@/hooks/useFieldError";
import { Controller, useFormContext } from "react-hook-form";
import {
  getGoalList,
  GetGoalListArgs,
  GetGoalListResponse,
  goalList,
} from "@/services/KPI";

type GoalsAutocompleteProps = {
  label: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
};

const GoalsAutoComplete = (props: GoalsAutocompleteProps) => {
  const { label, name = "goalId", required, placeholder, disabled } = props;
  const error = useFieldError(name);
  const { control } = useFormContext();
  const [goalList, setGoalList] = useState<goalList[]>([]);

  const { execute: fetchGoalList, isLoading } = useAsync<
    GetGoalListResponse,
    GetGoalListArgs
  >({
    requestFn: async (): Promise<GetGoalListResponse> => {
      return await getGoalList({
        sortColumnName: "",
        sortDirection: "",
        startIndex: 1,
        pageSize: 100000,
        filters: {
          createdBy: null,
          createdOnFrom: null,
          createdOnTo: null,
          departmentId: null,
          title: null,
        },
      });
    },
    onSuccess: ({ data }) => {
      setGoalList(data.result.goalList);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    fetchGoalList();
  }, []);

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
              options={goalList}
              getOptionLabel={(option) => option.title}
              value={
                goalList.find((goal) => goal.id.toString() === String(value)) ??
                null
              }
              onChange={(_event, value) => {
                onChange(value ? value.id.toString() : "");
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
                          {isLoading ? (
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

export default GoalsAutoComplete;
