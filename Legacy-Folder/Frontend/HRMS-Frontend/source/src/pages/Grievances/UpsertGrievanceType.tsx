import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Box, Checkbox, FormControlLabel, Paper, Stack } from "@mui/material";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import OwnerAutocomplete from "@/pages/Grievances/components/OwnerAutocomplete";
import BreadCrumbs from "@/components/@extended/Router";
import FormTextField from "@/components/FormTextField";
import GlobalLoader from "@/components/GlobalLoader/GlobalLoader";
import PageHeader from "@/components/PageHeader/PageHeader";
import ResetButton from "@/components/ResetButton/ResetButton";
import SubmitButton from "@/components/SubmitButton/SubmitButton";
import useAsync from "@/hooks/useAsync";
import {
  AddGrievanceTypeApiResponse,
  GrievanceTypeRequestArgs,
  addGrievanceType,
  UpdateGrievanceTypeApiResponse,
  updateGrievanceType,
  GetGrievanceResponseById,
  getGrievanceTypeById,
} from "@/services/Grievances";
import methods from "@/utils";
import FormInputContainer from "@/pages/Profile/components/FormInputContainer";
import FormInputGroup from "@/pages/Profile/components/FormInputGroup";
import { regex } from "@/utils/regexPattern";

const { nameMaxLength_50, nameMaxLength_250 } = regex;

type UpsertGrievanceProps = {
  mode: "add" | "edit";
};
const UpsertGrievanceType = ({ mode }: UpsertGrievanceProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const schema = Yup.object({
    grievanceTypeName: Yup.string()
      .trim()
      .max(nameMaxLength_50.number, nameMaxLength_50.message)
      .required("Type Name is required"),
    description: Yup.string()
      .trim()
      .max(nameMaxLength_250.number, nameMaxLength_250.message),
    l1Owner: Yup.array()
      .of(Yup.string())
      .min(1, "At least one L1 Owner is required")
      .required("L1 Owner is required"),
    l2Owner: Yup.array()
      .of(Yup.string())
      .min(1, "At least one L2 Owner is required")
      .required("L2 Owner is required"),
    l3Owner: Yup.array()
      .of(Yup.string())
      .min(1, "At least one L3 Owner is required")
      .required("L3 Owner is required"),

    tatL1: Yup.number()
      .typeError("TAT L1 must be a number")
      .required("TAT L1 is required")
      .min(1, "TAT L1 must be greater than 0")
      .integer("TAT L1 must be an integer"),

    tatL2: Yup.number()
      .typeError("TAT L2 must be a number")
      .required("TAT L2 is required")
      .min(1, "TAT L2 must be greater than 0")
      .integer("TAT L2 must be an integer"),

    tatL3: Yup.number()
      .typeError("TAT L3 must be a number")
      .required("TAT L3 is required")
      .min(1, "TAT L3 must be greater than 0")
      .integer("TAT L3 must be an integer"),

    isSelected: Yup.boolean().default(true),
  });

  type GrievanceFormValues = Yup.InferType<typeof schema>;
  // const [grievanceData,setGrievanceData]=useState<grievanceData>()
  const { execute: add, isLoading: addLoading } = useAsync<
    AddGrievanceTypeApiResponse,
    GrievanceTypeRequestArgs
  >({
    requestFn: async (
      args: GrievanceTypeRequestArgs
    ): Promise<AddGrievanceTypeApiResponse> => {
      return await addGrievanceType(args);
    },
    onSuccess: () => {
      toast.success("Grievance Added Successfully");
      navigate("/Grievance/grievance-configuration");
    },

    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const { execute: update, isLoading: updateLoading } = useAsync<
    UpdateGrievanceTypeApiResponse,
    GrievanceTypeRequestArgs
  >({
    requestFn: async (
      args: GrievanceTypeRequestArgs
    ): Promise<UpdateGrievanceTypeApiResponse> => {
      return await updateGrievanceType(args);
    },
    onSuccess: () => {
      toast.success("Grievance Updated Successfully");
      navigate("/Grievance/grievance-configuration");
    },

    onError: (err) => {
      methods.throwApiError(err);
    },
  });
  const { execute: getGrievanceData, isLoading } =
    useAsync<GetGrievanceResponseById>({
      requestFn: async (): Promise<GetGrievanceResponseById> => {
        return await getGrievanceTypeById(Number(id));
      },
      onSuccess: ({ data }) => {
        const grievance = data.result;
        reset({
          grievanceTypeName: grievance.grievanceName,
          description: grievance.description,
          l1Owner: grievance.l1OwnerId ? grievance.l1OwnerId.split(",") : [],
          l2Owner: grievance.l2OwnerId ? grievance.l2OwnerId.split(",") : [],
          l3Owner: grievance.l3OwnerId ? grievance.l3OwnerId.split(",") : [],
          tatL1: grievance.l1TatHours,
          tatL2: grievance.l2TatHours,
          tatL3: grievance.l3TatDays,
          isSelected: grievance.isAutoEscalation,
        });
      },

      onError: (err) => {
        methods.throwApiError(err);
      },
    });
  const onSubmit = (data: GrievanceFormValues) => {
    const payload: GrievanceTypeRequestArgs = {
      id: mode == "edit" ? Number(id) : 0,
      grievanceName: data.grievanceTypeName,
      description: String(data.description),
      l1OwnerIds: data.l1Owner.join(","),
      l1TatHours: data.tatL1,
      l2TatHours: data.tatL2,
      l3OwnerIds: data.l3Owner.join(","),
      l2OwnerIds: data.l2Owner.join(","),
      l3TatDays: data.tatL3,
      isAutoEscalation: data.isSelected,
    };
    if (mode == "edit") {
      update(payload);
    } else {
      add(payload);
    }
  };
  useEffect(() => {
    if (mode == "edit" && id) {
      getGrievanceData();
    }
  }, [id, mode]);
  const method = useForm<GrievanceFormValues>({
    resolver: yupResolver(schema),

    defaultValues: {
      grievanceTypeName: "",
      description: "",
      l1Owner: [],
      l2Owner: [],
      l3Owner: [],
      tatL1: 0,
      tatL2: 0,
      tatL3: 0,
      isSelected: true,
    },
  });
  const { handleSubmit, reset, control } = method;
  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <PageHeader
          variant="h3"
          title={mode == "add" ? "Add Grievance " : "Edit Grievance"}
        />

        <FormProvider {...method}>
          <Box
            component="form"
            padding="30px"
            display="flex"
            flexDirection="column"
            gap={4}
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormInputGroup>
              <FormInputContainer md={12}>
                <FormTextField
                  label="Grievance Type Name"
                  name="grievanceTypeName"
                  required
                />
              </FormInputContainer>
              <FormInputContainer md={12}>
                <FormTextField
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  maxLength={600}
                />
              </FormInputContainer>
            </FormInputGroup>

            <FormInputGroup>
              <FormInputContainer md={4}>
                <OwnerAutocomplete label="L1 Owner" name="l1Owner" required />
              </FormInputContainer>
              <FormInputContainer md={4}>
                <OwnerAutocomplete label="L2 Owner" name="l2Owner" required />
              </FormInputContainer>
              <FormInputContainer md={4}>
                <OwnerAutocomplete label="L3 Owner" name="l3Owner" required />
              </FormInputContainer>
            </FormInputGroup>

            <FormInputGroup>
              <FormInputContainer md={4}>
                <FormTextField
                  label="TAT L1 (in Hours)"
                  name="tatL1"
                  type="number"
                  placeholder="Enter time in hours"
                  required
                />
              </FormInputContainer>

              <FormInputContainer md={4}>
                <FormTextField
                  label="TAT L2 (in Hours)"
                  name="tatL2"
                  type="number"
                  placeholder="Enter time in hours"
                  required
                />
              </FormInputContainer>

              <FormInputContainer md={4}>
                <FormTextField
                  label="TAT L3 (in Days)"
                  name="tatL3"
                  type="number"
                  placeholder="Enter time in days"
                  required
                />
              </FormInputContainer>
            </FormInputGroup>

            <FormInputContainer md={12}>
              <Controller
                name="isSelected"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Auto Escalation"
                  />
                )}
              />
            </FormInputContainer>

            <Stack direction="row" gap={2} justifyContent="center">
              <SubmitButton type="submit" variant="contained">
                Submit
              </SubmitButton>
              <ResetButton />
            </Stack>
          </Box>
          {/* <GlobalLoader loading={isLoading || addLoading||updateLoading} /> */}
        </FormProvider>
      </Paper>
      <GlobalLoader loading={isLoading || addLoading || updateLoading} />
    </>
  );
};
export default UpsertGrievanceType;
