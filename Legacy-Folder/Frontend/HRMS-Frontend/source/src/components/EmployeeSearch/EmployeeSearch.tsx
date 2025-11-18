import {
  Box,
  Checkbox,
  InputAdornment,
  ListItemText,
  TextField,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import FormAutocomplete from "@/components/FormAutocomplete";
import { useDebounce } from "@/hooks/useDebounce";
import { AllEmployeeOptionType } from "@/pages/Attendance/types";
import useAsync from "@/hooks/useAsync";
import { GetEmployeeCodeAndNameList } from "@/services/Attendence/AttendenceService";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

interface EmployeeSearchProp {
  selectedEmployees: string[];
  setSelectedEmployees: (item: string[]) => void;
  enableExitEmployee?:boolean
}

export const EmployeeSearch = ({
  selectedEmployees,
  enableExitEmployee=false,
  setSelectedEmployees,
}: EmployeeSearchProp) => {
  const method = useForm({});
  const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
  const checkedIcon = <CheckBoxIcon fontSize="small" />;
  const [inputValue, setInputValue] = useState("");
  const mergeSelectedWithOptions = (options: AllEmployeeOptionType[]) => {
    const selectedOptions = selectedEmployees.map((empStr) => {
      const [id, name] = empStr.split(" - ");
      return { id, name };
    });

    const merged = [...options];
    selectedOptions.forEach((sel) => {
      if (!merged.find((opt) => opt.id === sel.id)) {
        merged.push(sel);
      }
    });

    return merged;
  };
  const [allEmployeeOptions, setAllEmployeeOptions] = useState<
    AllEmployeeOptionType[]
  >([]);
  const employeeNameCache = useRef<{
    [key: string]: AllEmployeeOptionType[];
  }>({});
  const { execute: fetchEmployeeCodeServiceList } = useAsync({
    requestFn: async (searchValue: string) => {
      return await GetEmployeeCodeAndNameList(searchValue, searchValue,enableExitEmployee);
    },
    onSuccess: (response, params) => {
      const searchValue = params || "";
      const data = response?.data as {
        result?: { employeeCode: string; employeeName: string }[];
      };
      const result = data.result;
      const options: AllEmployeeOptionType[] = (result || []).map((emp) => ({
        id: emp.employeeCode,
        name: emp.employeeName,
      }));
      const mergedOptions = mergeSelectedWithOptions(options);
      if (searchValue) {
        employeeNameCache.current[searchValue] = options;
      }
      setAllEmployeeOptions(mergedOptions);
    },
    onError: () => {
      setAllEmployeeOptions([]);
    },
  });
  const debouncedInputValue = useDebounce(inputValue, 600);

  useEffect(() => {
    if (
      !debouncedInputValue ||
      debouncedInputValue.trim() === "" ||
      debouncedInputValue.length < 3
    ) {
      return;
    }
    if (employeeNameCache.current[debouncedInputValue]) {
      setAllEmployeeOptions(
        mergeSelectedWithOptions(employeeNameCache.current[debouncedInputValue])
      );

      return;
    }
    fetchEmployeeCodeServiceList(debouncedInputValue);
  }, [debouncedInputValue]);

  return (
    <FormProvider {...method}>
      <Box sx={{ width: 300 }}>
        <FormAutocomplete
          name="employeeNames"
          multiple
          limitTags={1}
          options={allEmployeeOptions.map((opt) => `${opt.id} - ${opt.name}`)}
          value={selectedEmployees}
          onChange={(_, value) => {
            setSelectedEmployees(Array.isArray(value) ? value : []);
          }}
          inputValue={inputValue}
          onInputChange={(_, value) => {
            setInputValue(value);
          }}
          noOptionsText={
            inputValue.length === 0
              ? "Start typing to search employees"
              : inputValue.length < 3
                ? "Please enter at least 3 characters"
                : "No matching employees found"
          }
          ListboxProps={{
            style: { maxHeight: 4 * 36, overflowY: "auto" },
          }}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              <ListItemText primary={option} />
            </li>
          )}
          disableCloseOnSelect
          renderTags={() => null}
          renderInput={(params) => (
            <TextField
              {...params}
              sx={{
                width: "100%",
                "& .MuiInputLabel-root": {
                  transform: "translate(14px, 16px) scale(1)",
                },
                "& .MuiInputLabel-shrink": {
                  transform: "translate(14px, -9px) scale(0.75)",
                },
              }}
              onBlur={() => {
                setInputValue("");
                setAllEmployeeOptions((prevOptions) =>
                  prevOptions.filter((opt) =>
                    selectedEmployees.includes(`${opt.id} - ${opt.name}`)
                  )
                );
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Backspace" &&
                  inputValue === "" &&
                  selectedEmployees.length > 0
                ) {
                  e.stopPropagation();
                }
              }}
              label={"Search Employee"}
              variant="outlined"
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <InputAdornment position="start">
                    {selectedEmployees.length > 0 && (
                      <span style={{ color: "blue" }}>
                        ({selectedEmployees.length})
                      </span>
                    )}
                    {params.InputProps.endAdornment}
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </Box>
    </FormProvider>
  );
};
