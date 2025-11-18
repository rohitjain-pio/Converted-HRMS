import moment from "moment-timezone";

export function formatUtcToLocal(
  isoUtc: string,
  opts: {
    tz?: string;
    format?: string;
  } = {}
): string {
  const { tz, format = "DD MMM YYYY, hh:mm a" } = opts;

  const zone = tz || moment.tz.guess();
  return moment.utc(isoUtc).tz(zone).format(format);
}
