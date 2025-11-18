import * as Yup from "yup";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import useAsync from "@/hooks/useAsync";
import {
  AddProfessionalReferenceApiResponse,
  AddProfessionalReferenceArgs,
} from "@/services/EmploymentDetails";
import { addProfessionalReference } from "@/services/EmploymentDetails/employmentDetailsService";
import { toast } from "react-toastify";
import methods from "@/utils";
import { useEffect } from "react";
import { getValidationSchema } from "./validationSchema";
import { ReferenceMultiForm } from "./ReferenceMultiform";


type ReferenceMultiformProps = {
  open: boolean;
  onClose: () => void;
  previousEmployerId: number;
  professionalReferencesLength: number;
};

type FormDataType = Yup.InferType<ReturnType<typeof getValidationSchema>>;

const ReferenceMultiform = (props: ReferenceMultiformProps) => {
  const { open, onClose, previousEmployerId, professionalReferencesLength } =
    props;
  const validationSchema = getValidationSchema(professionalReferencesLength);
  const method = useForm<FormDataType>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      references: [
        {
          fullName: "",
          designation: "",
          email: "",
          contactNumber: "",
        },
        {
          fullName: "",
          designation: "",
          email: "",
          contactNumber: "",
        },
      ],
    },
  });

  const {
    control,
        reset,
    formState: { errors },
  } = method;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "references",
  });

  useEffect(() => {
    if (professionalReferencesLength === 2 && fields.length === 2) {
      remove(fields.length - 1);
    }
  }, [fields, remove]);

  const handleToggleThirdForm = () => {
    if (fields.length + professionalReferencesLength < 3) {
      append({
        fullName: "",
        designation: "",
        email: "",
        contactNumber: "",
      });
    } else if (fields.length + professionalReferencesLength > 2) {
      remove(fields.length - 1);
    }
  };

  const { execute: create, isLoading: isSaving } = useAsync<
    AddProfessionalReferenceApiResponse,
    AddProfessionalReferenceArgs
  >({
    requestFn: async (
      args: AddProfessionalReferenceArgs
    ): Promise<AddProfessionalReferenceApiResponse> => {
      return await addProfessionalReference(args);
    },
    onSuccess: ({ data }) => {
      toast.success(data.message);
      reset();
      onClose();
    },
    onError: (err) => {
      methods.throwApiError(err);
    },
  });

  const onSubmit = (formData: FormDataType) => {
    if (formData && formData.references) {
      const newFormData = formData.references.map((data) => ({
        ...data,
        previousEmployerId,
      }));
      create(newFormData);
    }
  };

  return (
    <>
      <ReferenceMultiForm
        onClose={onClose}
        open={open}
        professionalReferencesLength={professionalReferencesLength}
        errors={errors}
        fields={fields}
        handleToggleThirdForm={handleToggleThirdForm}
        isSaving={isSaving}
        method={method}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default ReferenceMultiform;
