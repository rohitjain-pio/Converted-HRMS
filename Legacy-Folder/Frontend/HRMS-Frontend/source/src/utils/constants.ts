import moment from "moment";
import { SortDirection } from "@tanstack/table-core";
import { MRT_PaginationState } from "material-react-table";
export const OTHER_RELATIONSHIP_ID = 6;
export const PERSONAL_DETAILS_DOCUMENT_ID = 1;
export const NOMINEE_DETAILS_DOCUMENT_ID = 2;

export const PersonalDetailDocumentTypeMap = {
  PAN_NUMBER: 1,
  AADHAR_NUMBER: 2,
  PASSPORT_NUMBER: 3,
  VOTER_CARD_NUMBER: 4,
  DRIVING_LICENSE_NUMBER: 5,
} as const;

export const EmployerDocumentTypeMap = {
  PREVIOUS: 1,
  CURRENT: 2,
} as const;

export const eventStatusToId = {
  "WIP / Pending Approval": 1,
  Upcoming: 2,
  Completed: 3,
} as const;

export const qualificationToId = {
  HSC: 1,
  SSC: 2,
  Diploma: 3,
  Graduation: 4,
  "Post Graduation": 5,
} as const;

export const permissionValue = {
  ROLE: {
    READ: "Read.Role",
    VIEW: "View.Role",
    CREATE: "Create.Role",
    EDIT: "Edit.Role",
    DELETE: "Delete.Role",
  },
  PERSONAL_DETAILS: {
    READ: "Read.PersonalDetails",
    VIEW: "View.PersonalDetails",
    CREATE: "Create.PersonalDetails",
    EDIT: "Edit.PersonalDetails",
    DELETE: "Delete.PersonalDetails",
  },
  EMPLOYMENT_DETAILS: {
    READ: "Read.EmploymentDetails",
    VIEW: "View.EmploymentDetails",
    CREATE: "Create.EmploymentDetails",
    EDIT: "Edit.EmploymentDetails",
    DELETE: "Delete.EmploymentDetails",
  },
  PREVIOUS_EMPLOYER: {
    READ: "Read.PreviousEmployer",
    VIEW: "View.PreviousEmployer",
    CREATE: "Create.PreviousEmployer",
    EDIT: "Edit.PreviousEmployer",
    DELETE: "Delete.PreviousEmployer",
  },
  EDUCATIONAL_DETAILS: {
    READ: "Read.EducationalDetails",
    VIEW: "View.EducationalDetails",
    CREATE: "Create.EducationalDetails",
    EDIT: "Edit.EducationalDetails",
    DELETE: "Delete.EducationalDetails",
  },
  NOMINEE_DETAILS: {
    READ: "Read.NomineeDetails",
    VIEW: "View.NomineeDetails",
    CREATE: "Create.NomineeDetails",
    EDIT: "Edit.NomineeDetails",
    DELETE: "Delete.NomineeDetails",
  },
  CERTIFICATION_DETAILS: {
    READ: "Read.Certificate",
    VIEW: "View.Certificate",
    CREATE: "Create.Certificate",
    EDIT: "Edit.Certificate",
    DELETE: "Delete.Certificate",
  },
  PROFESSIONAL_REFERENCE: {
    READ: "Read.ProfessionalReference",
    VIEW: "View.ProfessionalReference",
    CREATE: "Create.ProfessionalReference",
    EDIT: "Edit.ProfessionalReference",
    DELETE: "Delete.ProfessionalReference",
  },
  COMPANY_POLICY: {
    READ: "Read.CompanyPolicy",
    VIEW: "View.CompanyPolicy",
    CREATE: "Create.CompanyPolicy",
    EDIT: "Edit.CompanyPolicy",
    DELETE: "Delete.CompanyPolicy",
  },
  EVENTS: {
    READ: "Read.Events",
    VIEW: "View.Events",
    CREATE: "Create.Events",
    EDIT: "Edit.Events",
    DELETE: "Delete.Events",
  },
  EMPLOYEES: {
    READ: "Read.Employees",
    VIEW: "View.Employees",
    CREATE: "Create.Employees",
    EDIT: "Edit.Employees",
    DELETE: "Delete.Employees",
  },
  OFFICIAL_DETAILS: {
    READ: "Read.OfficialDetails",
    VIEW: "View.OfficialDetails",
    CREATE: "Create.OfficialDetails",
    EDIT: "Edit.OfficialDetails",
    DELETE: "Delete.OfficialDetails",
  },
  Attendance_Details: {
    READ: "Read.Attendance",
    VIEW: "View.Attendance",
    CREATE: "Create.Attendance",
    EDIT: "Edit.Attendance",
    DELETE: "Delete.Attendance",
  },
  ATTENDANCE_CONFIGURATION: {
    READ: "Read.AttendanceConfiguration",
  },
  ATTENDANCE_EMPLOYEE_REPORT: {
    READ: "Read.AttendanceEmployeeReport",
  },
  ASSET_DETAILS: {
    READ: "Read.Asset",
    VIEW: "View.Asset",
    CREATE: "Create.Asset",
    EDIT: "Edit.Asset",
    DELETE: "Delete.Asset",
  },
  LEAVE_DETAILS: {
    READ: "Read.Leave",
    VIEW: "View.Leave",
    CREATE: "Create.Leave",
    EDIT: "Edit.Leave",
    DELETE: "Delete.Leave",
  },
  DEVELOPER_LOGS: {
    READ: "Read.Logs",
  },
  LEAVE_APPROVAL: {
    READ: "Read.LeaveApproval",
  },
  LEAVE_CALENDAR: {
    READ: "Read.LeaveCalendar",
  },
  KPI: {
    READ: "Read.KPI",
    VIEW: "View.KPI",
    CREATE: "Create.KPI",
    EDIT: "Edit.KPI",
    DELETE: "Delete.KPI",
  },
  KPI_GOALS: {
    READ: "Read.KPIGoals",
  },
  KPI_DASHBOARD: {
    READ: "Read.KPIDashboard",
  },
  GRIEVANCE: {
    READ: "Read.Grievances",
    VIEW: "View.Grievances",
    CREATE: "Create.Grievances",
    EDIT: "Edit.Grievances",
    DELETE: "Delete.Grievances",
  },
  GRIEVANCE_DASHBOARD: {
    READ: "Read.AllGrievances",
  },
  GRIEVANCE_CONFIGURATION: {
    READ: "Read.GrievancesConfiguration",
  },
    SUPPORT: {
    READ: "Read.Support",
    VIEW: "View.Support",
    CREATE: "Create.Support",
    EDIT: "Edit.Support",
    DELETE: "Delete.Support",
  },
  SUPPORT_DASHBOARD: {
    READ: "Read.AllSupport",
  },
};

export const role = {
  EMPLOYEE: "Employee",
  SUPER_ADMIN: "SuperAdmin",
};

export const BUILD_VERSION_STORAGE_KEY = "Build-Version";

export const EmploymentStatus = {
  fullTime: 1,
  partTime: 2,
  probation: 3,
  internship: 4,
} as const;

export type EmploymentStatusKey = keyof typeof EmploymentStatus;

export type EmploymentStatusCode =
  (typeof EmploymentStatus)[EmploymentStatusKey];

export const EMPLOYMENT_STATUS_LABELS = {
  [EmploymentStatus.fullTime]: "Full Time",
  [EmploymentStatus.partTime]: "Part Time",
  [EmploymentStatus.probation]: "Probation",
  [EmploymentStatus.internship]: "Internship",
} as const;

export const EMPLOYMENT_STATUS_OPTIONS = Object.entries(
  EMPLOYMENT_STATUS_LABELS
).map(([key, value]) => ({ id: key, label: value }));

export const FEATURE_FLAG_STORAGE_KEY = "feature-flags";
export const FEATURE_FLAGS_URL = "/feature-flags.json";

export const JobTypes = {
  probation: 1,
  confirmed: 2,
  training: 3,
} as const;

type JobTypeKey = keyof typeof JobTypes;

export type JobType = (typeof JobTypes)[JobTypeKey];

export const NOTICE_PERIOD_CONFIG_BY_JOB_TYPE: Record<
  JobType,
  { amount: number; unit: moment.unitOfTime.DurationConstructor }
> = {
  [JobTypes.probation]: { amount: 15, unit: "days" },
  [JobTypes.confirmed]: { amount: 3, unit: "months" },
  [JobTypes.training]: { amount: 15, unit: "days" },
};

export const ResignationStatus = {
  pending: 1,
  revoked: 2,
  accepted: 3,
  cancelled: 4,
  completed: 5,
} as const;

export type ResignationStatusKey = keyof typeof ResignationStatus;

export type ResignationStatusCode =
  (typeof ResignationStatus)[ResignationStatusKey];

export const RESIGNATION_STATUS_LABELS = {
  [ResignationStatus.pending]: "Pending",
  [ResignationStatus.revoked]: "Revoked",
  [ResignationStatus.accepted]: "Accepted",
  [ResignationStatus.cancelled]: "Cancelled",
  [ResignationStatus.completed]: "Completed",
} as const;

export const RESIGNATION_STATUS_OPTIONS = Object.entries(
  RESIGNATION_STATUS_LABELS
).map(([key, value]) => ({ id: key, label: value }));

export const EarlyReleaseStatus = {
  pending: 1,
  accepted: 2,
  rejected: 3,
} as const;

export type EarlyReleaseStatusKey = keyof typeof EarlyReleaseStatus;
export type EarlyReleaseStatusValue =
  (typeof EarlyReleaseStatus)[EarlyReleaseStatusKey];

export const EARLY_RELEASE_STATUS_LABELS: Record<
  EarlyReleaseStatusValue,
  string
> = {
  [EarlyReleaseStatus.pending]: "Pending",
  [EarlyReleaseStatus.accepted]: "Accepted",
  [EarlyReleaseStatus.rejected]: "Rejected",
};

export const AssetCondition = {
  ok: 1,
  damaged: 2,
  missing: 3,
} as const;

export type AssetCondition = ValueOf<typeof AssetCondition>;

export const ASSET_CONDITION_LABELS = {
  [AssetCondition.ok]: "Ok",
  [AssetCondition.damaged]: "Damaged",
  [AssetCondition.missing]: "Missing",
} as const;

export const ASSET_CONDITION_OPTIONS = Object.entries(
  ASSET_CONDITION_LABELS
).map(([key, value]) => ({ id: key, label: value }));

export const KTStatus = {
  pending: 1,
  inProgress: 2,
  completed: 3,
};

export const KT_STATUS_LABELS = {
  [KTStatus.pending]: "Pending",
  [KTStatus.inProgress]: "In Progress",
  [KTStatus.completed]: "Completed",
};

export const FEATURE_FLAGS = {
  enableExitEmployee: "enableExitEmployee",
  enableAttendance: "enableAttendance",
  enableLeave: "enableLeave",
  enableITAsset: "enableITAsset",
  enableKPI: "enableKPI",
  enableGrievance: "enableGrievance",
  enableChatbot: "enableChatbot",
} as const;

export const FEATURE_FLAG_TO_MENU_ID = {
  [FEATURE_FLAGS.enableExitEmployee]: ["employees-exit"],
  [FEATURE_FLAGS.enableAttendance]: ["attendance"],
  [FEATURE_FLAGS.enableLeave]: ["leave"],
  [FEATURE_FLAGS.enableITAsset]: ["it-assets"],
  [FEATURE_FLAGS.enableKPI]: ["kpi"],
  [FEATURE_FLAGS.enableGrievance]: ["grievance"],
};

export const DaySlot = {
  FullDay: 1,
  FirstHalf: 2,
  SecondHalf: 3,
} as const;

export type DaySlot = ValueOf<typeof DaySlot>;

export const DAY_SLOT_LABELS = {
  [DaySlot.FullDay]: "Full Day",
  [DaySlot.FirstHalf]: "1st Half",
  [DaySlot.SecondHalf]: "2nd Half",
};

export const LeaveType = {
  Casual: 1,
  Earned: 2,
  Bereavement: 3,
  Advance: 5,
  Bucket: 6,
  Paternity: 8,
  Maternity: 9,
};

export type LeaveType = ValueOf<typeof LeaveType>;

export const LEAVE_TYPES = {
  [LeaveType.Casual]: {
    id: LeaveType.Casual,
    label: "Casual Leave",
    shortCode: "CL",
  },
  [LeaveType.Earned]: {
    id: LeaveType.Earned,
    label: "Earned Leave",
    shortCode: "EL",
  },
  [LeaveType.Bereavement]: {
    id: LeaveType.Bereavement,
    label: "Bereavement Leave",
    shortCode: "BL",
  },
  [LeaveType.Advance]: {
    id: LeaveType.Advance,
    label: "Advance Leave",
    shortCode: "AL",
  },
  [LeaveType.Bucket]: {
    id: LeaveType.Bucket,
    label: "Leave in Bucket",
    shortCode: "LB",
  },
  [LeaveType.Paternity]: {
    id: LeaveType.Paternity,
    label: "Paternity Leave",
    shortCode: "PL",
  },
  [LeaveType.Maternity]: {
    id: LeaveType.Maternity,
    label: "Maternity Leave",
    shortCode: "ML",
  },
};

export const LEAVE_TYPES_OPTIONS = Object.entries(LEAVE_TYPES).map(
  ([key, value]) => ({ id: String(key), label: value.label })
);

export const LeaveStatus = {
  Pending: 1,
  Accepted: 2,
  Rejected: 3,
} as const;

export type LeaveStatus = ValueOf<typeof LeaveStatus>;

export const LEAVE_STATUS_LABEL: Record<LeaveStatus, string> = {
  [LeaveStatus.Pending]: "Pending",
  [LeaveStatus.Accepted]: "Accepted",
  [LeaveStatus.Rejected]: "Rejected",
};

export const LeaveRequestType = {
  CompOff: 1,
  SwapLeave: 2,
} as const;

export type LeaveRequestType = ValueOf<typeof LeaveRequestType>;

export const LEAVE_REQUEST_TYPE_LABEL = {
  [LeaveRequestType.CompOff]: "Comp-Off",
  [LeaveRequestType.SwapLeave]: "Swap Leave",
} as const satisfies Record<LeaveRequestType, string>;

export const LEAVE_REQUEST_TYPE_OPTIONS = Object.entries(
  LEAVE_REQUEST_TYPE_LABEL
).map(([key, value]) => ({ id: key, label: value }));

export const BranchLocation = {
  Hyderabad: 1,
  Jaipur: 2,
  Pune: 3,
} as const;

export type BranchLocation = ValueOf<typeof BranchLocation>;

export const BRANCH_LOCATION_LABEL = {
  [BranchLocation.Hyderabad]: "Hyderabad",
  [BranchLocation.Jaipur]: "Jaipur",
  [BranchLocation.Pune]: "Pune",
} as const;

export const BRANCH_LOCATION_OPTIONS = Object.entries(
  BRANCH_LOCATION_LABEL
).map(([key, value]) => ({ id: key, label: value }));

export const EmployeeStatus = {
  Active: 1,
  FnFPending: 2,
  OnNotice: 3,
  ExEmployee: 4,
} as const;

export type EmployeeStatus = ValueOf<typeof EmployeeStatus>;

export const EMPLOYEE_STATUS_LABEL = {
  [EmployeeStatus.Active]: "Active",
  [EmployeeStatus.FnFPending]: "F&F Pending",
  [EmployeeStatus.OnNotice]: "On Notice",
  [EmployeeStatus.ExEmployee]: "Ex Employee",
} as const;

export const EMPLOYEE_STATUS_OPTIONS = Object.entries(
  EMPLOYEE_STATUS_LABEL
).map(([key, value]) => ({ id: key, label: value }));
export const EmailTemplateStatus = {
  InActive: 0,
  Active: 1,
};
export type EmailTemplateStatus = ValueOf<typeof EmailTemplateStatus>;

export const AssetStatus = {
  InInventory: 1,
  Allocated: 2,
  Retired: 3,
} as const;

export type AssetStatus = ValueOf<typeof AssetStatus>;

export const ASSET_STATUS_LABEL: Record<AssetStatus, string> = {
  [AssetStatus.InInventory]: "In Inventory",
  [AssetStatus.Allocated]: "Allocated",
  [AssetStatus.Retired]: "Retired",
};
export const AssetType = {
  Laptop: 1,
  Desktop: 2,
  Monitor: 3,
  Keyboard: 4,
  Mouse: 5,
  Printer: 6,
  Scanner: 7,
  UPS: 8,
  ExternalHardDrive: 9,
  Headset: 10,
  Webcam: 11,
  Projector: 12,
  SoftwareLicense: 13,
  NetworkCable: 14,
} as const;

export type AssetType = ValueOf<typeof AssetType>;

export const ASSET_TYPE_LABEL: Record<AssetType, string> = {
  [AssetType.Laptop]: "Laptop",
  [AssetType.Desktop]: "Desktop",
  [AssetType.Monitor]: "Monitor",
  [AssetType.Keyboard]: "Keyboard",
  [AssetType.Mouse]: "Mouse",
  [AssetType.Printer]: "Printer",
  [AssetType.Scanner]: "Scanner",
  [AssetType.UPS]: "UPS",
  [AssetType.ExternalHardDrive]: "External Hard Drive",
  [AssetType.Headset]: "Headset",
  [AssetType.Webcam]: "Webcam",
  [AssetType.Projector]: "Projector",
  [AssetType.SoftwareLicense]: "Software License",
  [AssetType.NetworkCable]: "Network Cable",
};

export const ASSET_STATUS_OPTIONS = Object.entries(ASSET_STATUS_LABEL).map(
  ([key, label]) => ({
    id: key,
    label,
  })
);

export const ASSET_TYPE_OPTIONS = Object.entries(ASSET_TYPE_LABEL).map(
  ([key, label]) => ({
    id: key,
    label,
  })
);

export const Quarter = {
  Q1: "Q1",
  Q2: "Q2",
  Q3: "Q3",
  Q4: "Q4",
} as const;

export type Quarter = ValueOf<typeof Quarter>;

export const QUARTER_LABEL = {
  [Quarter.Q1]: "Q1",
  [Quarter.Q2]: "Q2",
  [Quarter.Q3]: "Q3",
  [Quarter.Q4]: "Q4",
} as const;

export const QUARTERS_IN_ORDER: Quarter[] = [
  Quarter.Q1,
  Quarter.Q2,
  Quarter.Q3,
  Quarter.Q4,
];

export function isQuarter(x: unknown): x is Quarter {
  return typeof x === "string" && Object.values(Quarter).includes(x as Quarter);
}

export const QUARTER_OPTIONS = Object.entries(QUARTER_LABEL).map(
  ([key, label]) => ({
    value: key,
    label,
  })
);
export const KPI_STATUS = {
  NotCreated: 1,
  Assigned: 2,
  Submitted: 3,
  Reviewed: 4,
} as const;

export const KPI_STATUS_LABEL = {
  [KPI_STATUS.NotCreated]: "Not Created",
  [KPI_STATUS.Assigned]: "Assigned",
  [KPI_STATUS.Submitted]: "Submitted",
  [KPI_STATUS.Reviewed]: "Reviewed",
} as const;

export const KPI_STATUS_OPTIONS = Object.entries(KPI_STATUS_LABEL).map(
  ([key, label]) => ({
    id: key,
    label,
  })
);
export type KPI_STATUS = ValueOf<typeof KPI_STATUS>;
export const GrievanceLevel = {
  L1: 1,
  L2: 2,
  L3: 3,
} as const;

export type GrievanceLevel = ValueOf<typeof GrievanceLevel>;

export const GRIEVANCE_LEVEL_LABEL = {
  [GrievanceLevel.L1]: "L1",
  [GrievanceLevel.L2]: "L2",
  [GrievanceLevel.L3]: "L3",
} as const;

export const GRIEVANCE_LEVEL_OPTIONS = Object.entries(
  GRIEVANCE_LEVEL_LABEL
).map(([key, label]) => ({
  value: key,
  label,
}));

export const GrievanceStatus = {
  Open: 1,
  // InProgress: 2,
  Resolved: 3,
  // Closed: 4,
  Escalated: 5,
} as const;

export type GrievanceStatus = ValueOf<typeof GrievanceStatus>;

export const GRIEVANCE_STATUS_LABEL = {
  [GrievanceStatus.Open]: "Open",
  // [GrievanceStatus.InProgress]: "In Progress",
  [GrievanceStatus.Resolved]: "Resolved",
  // [GrievanceStatus.Closed]: "Closed",
  [GrievanceStatus.Escalated]: "Escalated",
} as const;

export const GRIEVANCE_STATUS_OPTIONS = Object.entries(
  GRIEVANCE_STATUS_LABEL
).map(([key, label]) => ({
  value: key,
  label,
}));

export const CronType = {
  FetchTimeDoctorTimeSheetStats: 1,
  MonthlyLeaveCredit: 2,
} as const;

export const CRON_TYPE_OPTIONS = [
  { id: "0", label: "--Run Cron--" },
  { id: "1", label: "Timedoctor timesheet stats" },
  { id: "2", label: "Monthly leave credit" },
] as const;

export type CronType = ValueOf<typeof CronType>;
export const GrievanceTatStatus = {
  OnTime: 1,
  Delayed: 2,
} as const;

export const GRIEVANCE_TAT_STATUS_LABEL = {
  [GrievanceTatStatus.OnTime]: "On-Time",
  [GrievanceTatStatus.Delayed]: "Delayed",
} as const;

export const GRIEVANCE_TAT_STATUS_OPTIONS = Object.entries(
  GRIEVANCE_TAT_STATUS_LABEL
).map(([key, label]) => ({
  value: key,
  label,
}));

export type GrievanceTatStatus = ValueOf<typeof GrievanceTatStatus>;
export const initialPagination: MRT_PaginationState = {
  pageIndex: 0,
  pageSize: 10,
};

export type APISortParams = {
  sortColumnName: string;
  sortDirection: "" | SortDirection;
};

export type APIPaginationParams = {
  startIndex: number;
  pageSize: number;
};

export type FilterFormHandle = {
  handleReset: () => void;
};

export const CompanyPolicyStatus = {
  Draft: 1,
  Active: 2,
  Inactive: 3,
} as const;

export type CompanyPolicyStatus = ValueOf<typeof CompanyPolicyStatus>;

export const COMPANY_POLICY_STATUS_LABEL = {
  [CompanyPolicyStatus.Draft]: "Draft",
  [CompanyPolicyStatus.Active]: "Active",
  [CompanyPolicyStatus.Inactive]: "Inactive",
} as const satisfies Record<CompanyPolicyStatus, string>;

export type CompanyPolicyStatusLabel = ValueOf<
  typeof COMPANY_POLICY_STATUS_LABEL
>;
export const BUG_TYPE = {
  Suggestion: 1,
  Bug: 2,
} as const;
export const BUG_TYPE_LABEL = {
  [BUG_TYPE.Suggestion]: "Suggestion",
  [BUG_TYPE.Bug]: "Bug",
} as const;

export const BUG_TYPE_OPTIONS = Object.entries(
 BUG_TYPE_LABEL
).map(([key, label]) => ({
  value: key,
  label,
}));
export type BUG_TYPE = ValueOf<typeof BUG_TYPE>;

export const FEEDBACK_STATUS={
  Open:1,
  InProgress:2,
  UnableToReproduce:3,
  NotFixing:4,
  NotApplicable:5,
  Closed:6
}

export const FEEDBACK_STATUS_LABEL = {
  [FEEDBACK_STATUS.Open]: "Open",
  [FEEDBACK_STATUS.InProgress]: "In Progress",
  [FEEDBACK_STATUS.UnableToReproduce]: "Unable to Reproduce",
  [FEEDBACK_STATUS.NotFixing]: "Not Fixing",
  [FEEDBACK_STATUS.NotApplicable]: "Not Applicable",
  [FEEDBACK_STATUS.Closed]: "Closed",
} as const;

export const FEEDBACK_STATUS_OPTIONS = Object.entries(FEEDBACK_STATUS_LABEL).map(
  ([key, label]) => ({
    value: key,
    label,
  })
);

export type FEEDBACK_STATUS = ValueOf<typeof FEEDBACK_STATUS>;

export const EmailType = {
  Birthday: 1,
  Anniversary: 2,
  Welcome: 3,
  GrievanceResolved: 4,
  ResignationApproved: 5,
  LeaveApplied: 6,
  LeaveApproval: 7,
  LeaveRejection: 8,
  ResignationApplied: 9,
  ResignationRejected: 10,
  EarlyReleaseRequested: 11,
  EarlyReleaseApproved: 12,
  EarlyReleaseRejected: 13,
  AccountClearanceGranted: 14,
  ITClearanceGranted: 15,
  GrievanceSubmitted: 16,
  NewRoleAdded: 17,
  UpdatedPolicy: 18,
  NewPolicyAdded: 19,
} as const;

export type EmailType = ValueOf<typeof EmailType>;

export const EMAIL_TYPE_LABELS = {
  [EmailType.Birthday]: "Birthday",
  [EmailType.Anniversary]: "Anniversary",
  [EmailType.Welcome]: "Welcome",
  [EmailType.GrievanceResolved]: "Grievance Resolved",
  [EmailType.ResignationApproved]: "Resignation Approved",
  [EmailType.LeaveApplied]: "Leave Applied",
  [EmailType.LeaveApproval]: "Leave Approval",
  [EmailType.LeaveRejection]: "Leave Rejection",
  [EmailType.ResignationApplied]: "Resignation Applied",
  [EmailType.ResignationRejected]: "Resignation Rejected",
  [EmailType.EarlyReleaseRequested]: "Early Release Requested",
  [EmailType.EarlyReleaseApproved]: "Early Release Approved",
  [EmailType.EarlyReleaseRejected]: "Early Release Rejected",
  [EmailType.AccountClearanceGranted]: "Account Clearance Granted",
  [EmailType.ITClearanceGranted]: "IT Clearance Granted",
  [EmailType.GrievanceSubmitted]: "Grievance Submitted",
  [EmailType.NewRoleAdded]: "New Role Added",
  [EmailType.UpdatedPolicy]: "Updated Policy",
  [EmailType.NewPolicyAdded]: "New Policy Added",}
  
export const EMAIL_TEMPLATE_OPTIONS = Object.entries(
  EMAIL_TYPE_LABELS
).map(([key, label]) => ({
  id: key,
  name:label,
}));

export const UserGuideStatus = {
  Published: 1,
  Draft: 2,
} as const;

export type UserGuideStatus = ValueOf<typeof UserGuideStatus>;

export const USER_GUIDE_STATUS_LABEL = {
  [UserGuideStatus.Published]: "Published",
  [UserGuideStatus.Draft]: "Draft",
} as const satisfies Record<UserGuideStatus, string>;

export type UserGuideStatusLabel = ValueOf<typeof USER_GUIDE_STATUS_LABEL>;

export const USER_GUIDE_STATUS_OPTIONS = Object.entries(
  USER_GUIDE_STATUS_LABEL
).map(([key, label]) => ({
  value: key,
  label,
}));

export const FormMode = {
  Read: "read",
  Create: "create",
  Edit: "edit",
} as const;

export type FormMode = ValueOf<typeof FormMode>;

type ValueOf<T> = T[keyof T];
