import { Controller, useFormContext } from "react-hook-form";
import { useFieldError } from "@/hooks/useFieldError";
import { useEffect, useState } from "react";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import {
  Autocomplete,
  CircularProgress,
  FormControl,
  FormHelperText,
  TextField,
} from "@mui/material";
import { getTeamList, GetTeamListResponse, TeamType } from "@/services/Employees";

type TeamAutocompleteProps = {
  label?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
};

const TeamAutocomplete = (props: TeamAutocompleteProps) => {
  const { label = "Team", name = "teamId", required, placeholder } = props;

  const error = useFieldError(name);
  const { control } = useFormContext();
  const [teamList, setTeamList] = useState<TeamType[]>([]);

  const { execute: fetchTeamList, isLoading } = useAsync<GetTeamListResponse>({
    requestFn: async (): Promise<GetTeamListResponse> => {
      return await getTeamList();
    },
    onSuccess: ({ data }) => {
      const { result } = data;
      setTeamList(result);
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  useEffect(() => {
    fetchTeamList();
  }, []);

  return (
    <FormControl
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
              options={teamList}
              getOptionLabel={(option) => option.name}
              value={
                teamList.find(
                  (team) => team.id.toString() === value.toString()
                ) ?? null
              }
              onChange={(_event, value) => {
                onChange(value ? value.id.toString() : "");
              }}
              renderInput={(params) => {
                return (
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
                      }
                    }}
                  />
                );
              }}
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

export default TeamAutocomplete;
