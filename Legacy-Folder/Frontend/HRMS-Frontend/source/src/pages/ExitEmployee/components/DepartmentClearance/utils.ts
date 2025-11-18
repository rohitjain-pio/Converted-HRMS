export type KTFormValues = {
  ktStatus: string;
  notes: string;
  ktUser: string[];
  departmentAttachment?: File | null | string;
};

export const defaultValues: KTFormValues = {
  ktStatus: "1",
  notes: "",
  ktUser: [],
  departmentAttachment: null,
};

export const Kt_Status_Options = [
  { id: "1", label: "Pending" },
  { id: "2", label: "In Progress" },
  { id: "3", label: "Completed" },
];
