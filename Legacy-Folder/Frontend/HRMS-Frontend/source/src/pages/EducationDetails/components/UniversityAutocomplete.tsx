import { useState } from "react";
import {
  getUniversityList,
  GetUniversityListApiResponse,
  UniversityType,
} from "@/services/EducationDetails";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import FormAutocomplete from "@/components/FormAutocomplete";
import { CircularProgress, TextField } from "@mui/material";
import { useFieldError } from "@/hooks/useFieldError";

type UniversityAutocompleteProps = {
  label: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
};

const UniversityAutocomplete = (props: UniversityAutocompleteProps) => {
  const { label, name = "collegeUniversity", required, placeholder } = props;
  const [universityList, setUniversityList] = useState<UniversityType[]>([]);
  const [open, setOpen] = useState(false);
  const error = useFieldError(name);

  const handleOpen = () => {
    setOpen(true);
    fetchUniversityList();
  };

  const handleClose = () => {
    setOpen(false);
    setUniversityList([]);
  };

  const { execute: fetchUniversityList, isLoading } =
    useAsync<GetUniversityListApiResponse>({
      requestFn: async (): Promise<GetUniversityListApiResponse> => {
        return await getUniversityList();
      },
      onSuccess: ({ data }) => {
        const { result } = data;
        setUniversityList(result);
      },
      onError: (err) => {
        methods.throwApiError(err);
      },
    });

  return (
    <FormAutocomplete
      freeSolo
      autoSelect
      name={name}
      options={universityList.map((university) => university.name)}
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      loading={isLoading}
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
            }
          }}
        />
      )}
    />
  );
};

export default UniversityAutocomplete;
