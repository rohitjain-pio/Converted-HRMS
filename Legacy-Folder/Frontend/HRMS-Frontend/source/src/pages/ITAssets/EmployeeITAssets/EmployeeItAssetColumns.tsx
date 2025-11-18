import { TruncatedText } from "@/components/TruncatedText/TruncatedText";
import { EmployeeAsset } from "@/services/AssetManagement";
import { ASSET_CONDITION_LABELS, ASSET_TYPE_LABEL } from "@/utils/constants";
import { formatDate } from "@/utils/formatDate";


export const getEmployeeAssetHeaderCells = (
  startIndex: number,
  pageSize: number
) => [
  {
    label: "S.No",
    accessor: "sNo",
    width: "50px",
    renderColumn: (_row: EmployeeAsset, index: number) =>
      (startIndex - 1) * pageSize + index + 1,
  },
  {
    label: "Serial Number",
    accessor: "serialNumber",
    width: "250px",
    renderColumn: (row: EmployeeAsset) => (
      <TruncatedText
        text={row.serialNumber}
        tooltipTitle={row.serialNumber}
        maxLength={20}
      />
    ),
  },
  {
    label: "Manufacturer",
    accessor: "manufacturer",
    width: "125px",
    renderColumn: (row: EmployeeAsset) => (
      <TruncatedText
        text={row.manufacturer}
        tooltipTitle={row.manufacturer}
        maxLength={20}
      />
    ),
  },
  {
    label: "Model",
    accessor: "model",
    width: "125px",
    renderColumn: (row: EmployeeAsset) => (
      <TruncatedText
        text={row.model}
        tooltipTitle={row.model}
        maxLength={20}
      />
    ),
  },
  {
    label: "Asset Type",
    accessor: "assetType",
    width: "125px",
    renderColumn: (row: EmployeeAsset) => (
      <TruncatedText
        text={ASSET_TYPE_LABEL[row.assetType]}
        tooltipTitle={ASSET_TYPE_LABEL[row.assetType]}
        maxLength={20}
      />
    ),
  },
  {
    label: "Issue Date",
    accessor: "issueDate",
    width: "140px",
    renderColumn: (row: EmployeeAsset) =>
      row.assignedOn ? formatDate(row.assignedOn) : "",
  },
  {
    label: "Return Date",
    accessor: "returnDate",
    width: "140px",
    renderColumn: (row: EmployeeAsset) =>
      row.returnDate ? formatDate(row.returnDate) : "Not Yet Returned",
  },
  {
    label: "Issued By",
    accessor: "issuedBy",
    width: "140px",
    renderColumn: (row: EmployeeAsset) => (
      <TruncatedText
        text={row.assignedBy}
        tooltipTitle={row.assignedBy}
        maxLength={20}
      />
    ),
  },
  {
    label: "Current Condition",
    accessor: "currentReturnCondition",
    width: "125px",
    renderColumn: (row: EmployeeAsset) => (
      <TruncatedText
        text={ASSET_CONDITION_LABELS[row.assetCondition]}
        tooltipTitle={row.assetCondition}
        maxLength={20}
      />
    ),
  },
];