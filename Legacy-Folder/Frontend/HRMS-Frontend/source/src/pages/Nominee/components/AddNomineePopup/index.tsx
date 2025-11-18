import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { OTHER_RELATIONSHIP_ID } from "@/utils/constants";
import {
  addNominee,
  AddNomineeArgs,
  AddNomineeResponse,
  getNomineeById,
  GetNomineeByIdResponse,
  NomineeType,
  updateNominee,
  UpdateNomineeArgs,
} from "@/services/Nominee";
import { toast } from "react-toastify";
import useAsync from "@/hooks/useAsync";
import methods from "@/utils";
import { useUserStore } from "@/store";
import moment from "moment";
import { onCloseHandler } from "@/utils/dialog";
import { useSearchParams } from "react-router-dom";
import { AddNomineePopupProps, calculateAge } from "./utils";
import AddNomineeDialog from "./AddNomineeDialog";
import { getValidationSchema } from "./validationSchema";


type FormData = Yup.InferType<ReturnType<typeof getValidationSchema>>;

const AddNomineePopup = ({
  open,
  onClose,
  nomineeId,
  totalPercentage,
  nomineePercentage,
}: AddNomineePopupProps) => {
  const { userData } = useUserStore();
  const [searchParams] = useSearchParams();
  const employeeId = searchParams.get("employeeId");
  const [showOtherRelationship, setShowOtherRelationship] = useState(false);
  const [isRequiredCareOf, setIsRequiredCareOf] = useState(false);
  const [nomineeData, setNomineeData] = useState<NomineeType>();
  const validationSchema = getValidationSchema(
    nomineeId && nomineeData?.fileName ? false : true
  );
  const method = useForm<FormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      nomineeName: "",
      dob: undefined,
      age: 0,
      careOf: "",
      relationshipId: "",
      others: "",
      percentage: 0,
      idProofDocType: "",
      file: null,
    },
    context: {
      remaining:
        100 -
        (nomineePercentage
          ? totalPercentage - nomineePercentage
          : totalPercentage),
    },
  });
  const { watch, reset, setValue } = method;

  const selectedRelationship = watch("relationshipId");
  const dobValue = watch("dob");
  const ageValue = watch("age");
  const careOfValue = watch("careOf");

  useEffect(() => {
    if (dobValue) {
      const age = calculateAge(new Date(dobValue.toDate()));
      setValue("age", age, { shouldValidate: true });
      setValue("careOf", careOfValue, { shouldValidate: true });
    } else {
      setValue("age", 0);
      setValue("careOf", "");
    }
  }, [dobValue, setValue, careOfValue]);

  useEffect(() => {
    if (Number(selectedRelationship) === OTHER_RELATIONSHIP_ID) {
      setShowOtherRelationship(true);
    } else {
      setShowOtherRelationship(false);
      setValue("others", "");
    }
  }, [selectedRelationship, setValue]);

  useEffect(() => {
    if (ageValue < 18) {
      setIsRequiredCareOf(true);
    } else {
      setIsRequiredCareOf(false);
      setValue("careOf", "");
    }
  }, [ageValue, setValue]);

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const { isLoading } = useAsync<GetNomineeByIdResponse, number>({
    requestFn: async (id: number): Promise<GetNomineeByIdResponse> => {
      return await getNomineeById(id);
    },
    onSuccess: (response) => {
      const {
        nomineeName,
        dob,
        age,
        careOf,
        percentage,
        relationshipId,
        others,
        idProofDocType,
      } = response?.data?.result as NomineeType;
      setNomineeData(response?.data?.result);
      setValue("nomineeName", nomineeName);
      setValue("dob", moment(dob, "YYYY-MM-DD"));
      setValue("age", age);
      setValue("careOf", careOf || "");
      setValue("percentage", percentage);
      setValue("relationshipId", relationshipId || "");
      setValue("others", others);
      setValue("idProofDocType", idProofDocType || "");
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
    defaultParams: nomineeId as number | undefined,
    autoExecute: nomineeId ? true : false,
  });

  const { execute: create, isLoading: isSaving } = useAsync<
    AddNomineeResponse,
    AddNomineeArgs
  >({
    requestFn: async (args: AddNomineeArgs): Promise<AddNomineeResponse> => {
      return await addNominee(args);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const { execute: update, isLoading: isUpdating } = useAsync<
    AddNomineeResponse,
    UpdateNomineeArgs
  >({
    requestFn: async (args: UpdateNomineeArgs): Promise<AddNomineeResponse> => {
      return await updateNominee(args);
    },
    onSuccess: (response) => {
      toast.success(response.data.message);
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const onSubmit = (data: FormData) => {
    if (nomineeId) {
      update({
        Id: Number(nomineeId),
        EmployeeId: employeeId ? +employeeId : Number(userData.userId),
        NomineeName: data.nomineeName,
        DOB: moment(data.dob).format("YYYY-MM-DD"),
        Age: data.age,
        CareOf: data.careOf || "",
        Percentage: data.percentage,
        Relationship: Number(data.relationshipId),
        Others: data.others || "",
        File: data.file || "",
        IdProofDocType: Number(data.idProofDocType),
      });
    } else {
      create({
        EmployeeId: employeeId ? +employeeId : Number(userData.userId),
        NomineeName: data.nomineeName,
        DOB: moment(data.dob).format("YYYY-MM-DD"),
        Age: data.age,
        CareOf: data.careOf || "",
        Percentage: data.percentage,
        Relationship: Number(data.relationshipId),
        Others: data.others || "",
        File: data.file,
        IdProofDocType: Number(data.idProofDocType),
      });
    }
  };

  const handleResetForm = () => {
    if (nomineeId) {
      const {
        nomineeName,
        dob,
        age,
        careOf,
        percentage,
        relationshipId,
        others,
        idProofDocType,
      } = nomineeData as NomineeType;
      setValue("nomineeName", nomineeName);
      setValue("dob", moment(dob, "YYYY-MM-DD"));
      setValue("age", age);
      setValue("careOf", careOf || "");
      setValue("percentage", percentage);
      setValue("relationshipId", relationshipId || "");
      setValue("others", others);
      setValue("idProofDocType", idProofDocType || "");
    } else {
      reset();
    }
  };

  return (
    <AddNomineeDialog
      open={open}
      onClose={onClose}
      onCloseHandler={onCloseHandler}
      nomineeId={nomineeId}
      nomineeData={nomineeData}
      method={method}
      onSubmit={onSubmit}
      handleResetForm={handleResetForm}
      isSaving={isSaving}
      isUpdating={isUpdating}
      isLoading={isLoading}
      showOtherRelationship={showOtherRelationship}
      isRequiredCareOf={isRequiredCareOf}
    />
  );
};

export default AddNomineePopup;
