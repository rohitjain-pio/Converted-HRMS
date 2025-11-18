import { FieldArrayWithId, UseFormReturn, FieldErrors } from "react-hook-form";

export interface props {
  open: boolean;
  onClose: () => void;
  fields: FieldArrayWithId<
    {
      references?:
        | {
            designation: string;
            email: string;
            fullName: string;
            contactNumber: string;
          }[]
        | undefined;
    },
    "references",
    "id"
  >[];
  isSaving:boolean
  method: UseFormReturn<
    {
      references?:
        | {
            fullName: string;
            designation: string;
            email: string;
            contactNumber: string;
          }[]
        | undefined;
    },
    undefined
  >;
  onSubmit: (formData: FormDataType) => void;
  errors: FieldErrors<{
    references?:
      | {
          fullName: string;
          email: string;
          designation: string;
          contactNumber: string;
        }[]
      | undefined;
  }>;

  handleToggleThirdForm: () => void;
  professionalReferencesLength: number;
}
export type FormDataType = {
  references?:
    | {
        fullName: string;
        designation: string;
        email: string;
        contactNumber: string;
      }[]
    | undefined;
};