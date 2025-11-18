import moment, { Moment } from "moment";

type FormValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | File
  | Blob
  | Date
  | Moment;

export function objectToFormData(
  data: Record<string, FormValue>,
  dateFormat?: string
) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      if (!dateFormat) {
        throw new Error(
          `Date format is required for the field ${key} with Date value.`
        );
      }
      formData.append(key, moment(value).format(dateFormat));
    } else if (moment.isMoment(value)) {
      if (!dateFormat) {
        throw new Error(
          `Date format is required for the field ${key} with Moment value.`
        );
      }
      formData.append(key, value.format(dateFormat));
    } else if (typeof value === "number" || typeof value === "boolean") {
      formData.append(key, value.toString());
    } else if (value === null || typeof value === "undefined") {
      throw new Error(
        `The value of the field ${key} is ${value === null ? "null" : "undefined"}. All fields must have valid values.`
      );
    } else {
      formData.append(key, value);
    }
  }

  return formData;
}
