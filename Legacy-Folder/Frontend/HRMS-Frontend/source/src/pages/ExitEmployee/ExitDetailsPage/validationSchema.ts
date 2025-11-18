import moment from "moment";
import * as Yup from "yup";
export const rejectionSchema = Yup.object().shape({
  comment: Yup.string().defined(),
});

export type RejectForm = Yup.InferType<typeof rejectionSchema>;

export const acceptEarlyReleaseSchema = Yup.object().shape({
  releaseDate: Yup.mixed<moment.Moment>()
    .nullable()
    .defined()
    .test("required", "Early release date is required", (releaseDate) => {
      if (!releaseDate) {
        return false;
      }

      return true;
    })
    .test("is-valid", "Invalid Date", (releaseDate) => {
      if (!releaseDate) {
        return true;
      }

      return moment.isMoment(releaseDate) && moment(releaseDate).isValid();
    }),
});

export type AcceptEarlyReleaseForm = Yup.InferType<
  typeof acceptEarlyReleaseSchema
>;

export const updateLastWorkingSchema = Yup.object().shape({
  lastWorkingDay: Yup.mixed<moment.Moment>()
    .nullable()
    .defined()
    .test("required", "Last working day is required", (lastWorkingDay) => {
      if (!lastWorkingDay) {
        return false;
      }

      return true;
    })
    .test("is-valid", "Invalid Date", (lastWorkingDay) => {
      if (!lastWorkingDay) {
        return true;
      }

      return (
        moment.isMoment(lastWorkingDay) && moment(lastWorkingDay).isValid()
      );
    }),
});
export type UpdateLastWorkingForm = Yup.InferType<
  typeof updateLastWorkingSchema
>;
