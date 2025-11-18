import moment from "moment";
import * as Yup from "yup";
export const earlyReleaseSchema = Yup.object().shape({
  agreed: Yup.boolean()
    .defined()
    .oneOf([true], "You must agree to the policy to continue"),
  releaseDate: Yup.mixed<moment.Moment>()
    .required("Please select a date")
    .test({
      name: "is-valid",
      message: "Invalid Date",
      test: (releaseDate) => {
        if (!releaseDate) {
          return true;
        }

        return moment.isMoment(releaseDate);
      },
    })
    .test({
      name: "no-past-dates",
      message: "Release date cannot be in the past",
      test: (releaseDate) => {
        if (!releaseDate) {
          return true;
        }

        return releaseDate.isSameOrAfter(moment(), "day");
      },
    })
    .test({
      name: "no-after-last-working-day",
      message: "Release date cannot be after allowed maximum date",
      test: (releaseDate, context) => {
        const lastWorkingDay = context.options.context?.lastWorkingDay;

        if (!releaseDate || typeof lastWorkingDay !== "string") {
          return true;
        }

        const maxDay = moment(lastWorkingDay, "YYYY-MM-DD");

        if (!maxDay.isValid()) {
          return true;
        }

        return releaseDate.isSameOrBefore(maxDay, "day");
      },
    }),
});
