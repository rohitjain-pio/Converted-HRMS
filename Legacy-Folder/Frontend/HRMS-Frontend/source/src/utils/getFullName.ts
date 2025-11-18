export function getFullName({
  firstName,
  middleName,
  lastName,
}: {
  firstName: string;
  middleName?: string;
  lastName: string;
}) {
  return middleName
    ? `${firstName} ${middleName} ${lastName}`
    : `${firstName} ${lastName}`;
}
