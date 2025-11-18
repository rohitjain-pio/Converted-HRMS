import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import RoleDetails from "@/pages/Roles/Details";
import Loadable from "@/components/Loadable";
import DashboardLayout from "@/layout/Dashboard";
import ProtectedRoute from "@/ProtectedRoute";
import {
  FEATURE_FLAGS,
  FormMode,
  permissionValue,
  role,
} from "@/utils/constants";
import EditEmploymentDetails from "@/pages/EmploymentDetails/components/EditEmploymentDetails";
import InternalUserLogin from "@/pages/Login/InternalUserLogin";
import Department from "@/pages/Settings/Department";
import Designation from "@/pages/Settings/Designation";
import Team from "@/pages/Settings/Team";
import { lazyWithRetry } from "@/components/lazyWithRetry";
import FeatureGuard from "@/FeatureGuard";
import AssetDetailsLayout from "@/pages/AssetManagement/AssetDetails/AssetDetailsLayout";
import AssetGeneralPage from "@/pages/AssetManagement/AssetDetails/AssetGeneralPage";
import { HistoryTable } from "@/pages/AssetManagement/components/HistoryTable";

const LeaveApproval = Loadable(
  lazyWithRetry(() => import("@/pages/Leaves/LeaveApproval"))
);
const LeaveCalendarAdmin = Loadable(
  lazyWithRetry(() => import("@/pages/LeaveCalenderAdmin"))
);
const LoginPage = Loadable(lazyWithRetry(() => import("@/pages/Login")));
const NotFoundPage = Loadable(
  lazyWithRetry(() => import("@/pages/NotFoundPage"))
);
const DashboardDefault = Loadable(
  lazyWithRetry(() => import("@/pages/Dashboard"))
);
const RolesPage = Loadable(lazyWithRetry(() => import("@/pages/Roles")));
const CompanyPolicyPage = Loadable(
  lazyWithRetry(() => import("@/pages/CompanyPolicy"))
);
const CompanyPolicyDetailPage = Loadable(
  lazyWithRetry(() => import("@/pages/CompanyPolicy/Detail"))
);
const EventDetailPage = Loadable(
  lazyWithRetry(() => import("@/pages/Events/Detail"))
);
const EditCompanyPolicyPage = Loadable(
  lazyWithRetry(() => import("@/pages/CompanyPolicy/Edit"))
);
const ProfilePage = Loadable(lazyWithRetry(() => import("@/pages/Profile")));
const EmployeeListPage = Loadable(
  lazyWithRetry(() => import("@/pages/Employee/EmployeeTable/index"))
);
const EventsPage = Loadable(lazyWithRetry(() => import("@/pages/Events")));
const Unauthorized = Loadable(
  lazyWithRetry(() => import("@/pages/Unauthorized"))
);
const EditEventsPage = Loadable(
  lazyWithRetry(() => import("@/pages/Events/Edit/EditEventsPage"))
);
const AddEmployeePage = Loadable(
  lazyWithRetry(() => import("@/pages/Employee/Add/AddEmployee"))
);
const AttendancePage = Loadable(
  lazyWithRetry(() => import("@/pages/Attendance/Employee/index"))
);
const AttendanceConfigurationPage = Loadable(
  lazyWithRetry(
    () => import("@/pages/Attendance/AttendanceConfiguration/index")
  )
);
const AttendanceEmployeeReportPage = Loadable(
  lazyWithRetry(() => import("@/pages/Attendance/EmployeeReport/index"))
);
const ResignationFormPage = Loadable(
  lazyWithRetry(() => import("@/pages/Resignation/ResignationForm"))
);
const ExitEmployeeListPage = Loadable(
  lazyWithRetry(() => import("@/pages/ExitEmployee/ExitEmployeeListPage/index"))
);
const ExitDetailsPage = Loadable(
  lazyWithRetry(() => import("@/pages/ExitEmployee/ExitDetailsPage/index"))
);
const LeaveFormPage = Loadable(
  lazyWithRetry(() => import("@/pages/Leaves/LeaveFormPage"))
);
const LeaveDashboard = Loadable(
  lazyWithRetry(() => import("@/pages/Leaves/LeaveDashboard"))
);
const LeaveDetailsPage = Loadable(
  lazyWithRetry(() => import("@/pages/Leaves/LeaveDetailsPage"))
);
const EmailTemplates = Loadable(
  lazyWithRetry(() => import("@/pages/Email/components/EmailTemplate"))
);
const EmailTable = Loadable(
  lazyWithRetry(() => import("@/pages/Email/components/EmailTable/index"))
);
const ItAssetPage = Loadable(
  lazyWithRetry(() => import("@/pages/AssetManagement/ItAssetTable/index"))
);
const DeveloperLogsPage = Loadable(
  lazyWithRetry(() => import("@/pages/Developer/Logging/LogsTable.tsx/index"))
);
const DeveloperLogDetailsPage = Loadable(
  lazyWithRetry(() => import("@/pages/Developer/Logging/Detail/LogDetails"))
);
const CronJobsPage = Loadable(
  lazyWithRetry(() => import("@/pages/Developer/Crons/LogsTable/index"))
);
const AddITAssetPage = Loadable(
  lazyWithRetry(() => import("@/pages/AssetManagement/AddITAssetPage"))
);

const EmployeeKPI = Loadable(
  lazyWithRetry(() => import("@/pages/KPI/EmployeeKPI/index"))
);

const KpiDetails = Loadable(
  lazyWithRetry(() => import("@/pages/KPI/KpiDetails/index"))
);

const GoalPage = Loadable(
  lazyWithRetry(() => import("@/pages/KPI/GoalListPage/index"))
);
const UpsertGoalsPage = Loadable(
  lazyWithRetry(() => import("@/pages/KPI/UpsertGoalPage"))
);
const EmployeeGoalsPage = Loadable(
  lazyWithRetry(() => import("@/pages/KPI/MangerDashboardPage/index"))
);
const GrievanceDashboard = Loadable(
  lazyWithRetry(() => import("@/pages/Grievances/GrievanceConfiguration/index"))
);
const UpsertGrievanceType = Loadable(
  lazyWithRetry(() => import("@/pages/Grievances/UpsertGrievanceType"))
);

const EmployeeGrievanceListPage = Loadable(
  lazyWithRetry(
    () => import("@/pages/Grievances/EmployeeGrievanceListPage/index")
  )
);

const GrievanceTicketPage = Loadable(
  lazyWithRetry(
    () => import("@/pages/Grievances/TicketPage/GrievanceTicketPage")
  )
);
const GrievanceAdminPage = Loadable(
  lazyWithRetry(() => import("@/pages/Grievances/GrievanceAdminReport/index"))
);

const AddGrievancePage = Loadable(
  lazyWithRetry(() => import("@/pages/Grievances/AddGrievancePage"))
);
const EmployeeFeedBackListPage = Loadable(
  lazyWithRetry(() => import("@/pages/Support/SupportEmployeePage/index"))
);
const FeedBackAdminPage = Loadable(
  lazyWithRetry(() => import("@/pages/Support/SupportAdminPage/index"))
);
const FeedBackDetailPage = Loadable(
  lazyWithRetry(() => import("@/pages/Support/SupportDetailPage/index"))
);

const UpsertUserGuide = Loadable(
  lazyWithRetry(() => import("@/pages/UserGuide/UpsertUserGuide"))
);

const UserGuideListPage = Loadable(
  lazyWithRetry(
    () => import("@/pages/UserGuide/UserGuideListPage/UserGuideListPage")
  )
);

const CustomRoute = () => {
  const {
    ROLE,
    COMPANY_POLICY,
    PERSONAL_DETAILS,
    EMPLOYMENT_DETAILS,
    EDUCATIONAL_DETAILS,
    NOMINEE_DETAILS,
    CERTIFICATION_DETAILS,
    EVENTS,
    EMPLOYEES,
    OFFICIAL_DETAILS,
    Attendance_Details,
    ASSET_DETAILS,
    LEAVE_DETAILS,
    DEVELOPER_LOGS,
    ATTENDANCE_CONFIGURATION,
    ATTENDANCE_EMPLOYEE_REPORT,
    LEAVE_APPROVAL,
    LEAVE_CALENDAR,
    KPI,
    KPI_GOALS,
    KPI_DASHBOARD,
    GRIEVANCE,
    GRIEVANCE_DASHBOARD,
    GRIEVANCE_CONFIGURATION,
    SUPPORT,
    SUPPORT_DASHBOARD,
  } = permissionValue;

  const {
    enableExitEmployee,
    enableAttendance,
    enableLeave,
    enableITAsset,
    enableKPI,
    enableGrievance,
  } = FEATURE_FLAGS;
  const defaultRedirectTo = "/not-found";

  const getRoutes = () => [
    {
      path: "/",
      element: <DashboardLayout />,
      children: [
        {
          path: "/",
          element: <LoginPage />,
        },
        {
          path: "/dashboard",
          element: <DashboardDefault />,
        },
        {
          path: "/profile/personal-details",
          element: (
            <ProtectedRoute requiredPermission={PERSONAL_DETAILS.READ}>
              <ProfilePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/profile/employment-details",
          element: (
            <ProtectedRoute requiredPermission={EMPLOYMENT_DETAILS.READ}>
              <ProfilePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/profile/nominee-details",
          element: (
            <ProtectedRoute requiredPermission={NOMINEE_DETAILS.READ}>
              <ProfilePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/profile/education-details",
          element: (
            <ProtectedRoute requiredPermission={EDUCATIONAL_DETAILS.READ}>
              <ProfilePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/profile/certificate-details",
          element: (
            <ProtectedRoute requiredPermission={CERTIFICATION_DETAILS.READ}>
              <ProfilePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/profile/official-details",
          element: (
            <ProtectedRoute requiredPermission={OFFICIAL_DETAILS.READ}>
              <ProfilePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/profile/exit-details",
          element: (
            <ProtectedRoute requiredPermission={PERSONAL_DETAILS.READ}>
              <FeatureGuard
                flag={enableExitEmployee}
                redirectTo={defaultRedirectTo}
              >
                <ProfilePage />
              </FeatureGuard>
            </ProtectedRoute>
          ),
        },
        {
          path: "/profile/it-assets",
          element: (
            <FeatureGuard flag={enableITAsset} redirectTo={defaultRedirectTo}>
              <ProfilePage />
            </FeatureGuard>
          ),
        },
        {
          path: "/leave",
          children: [
            {
              path: "apply-leave",
              element: (
                <ProtectedRoute requiredPermission={LEAVE_DETAILS.READ}>
                  <FeatureGuard
                    flag={enableLeave}
                    redirectTo={defaultRedirectTo}
                  >
                    <LeaveDashboard />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "apply-leave/add/:leaveType",
              element: (
                <ProtectedRoute requiredPermission={LEAVE_DETAILS.CREATE}>
                  <FeatureGuard
                    flag={enableLeave}
                    redirectTo={defaultRedirectTo}
                  >
                    <LeaveFormPage />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "details/:requestId",
              element: (
                <ProtectedRoute requiredPermission={LEAVE_DETAILS.READ}>
                  <FeatureGuard
                    flag={enableLeave}
                    redirectTo={defaultRedirectTo}
                  >
                    <LeaveDetailsPage />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "leave-approval",
              element: (
                <ProtectedRoute requiredPermission={LEAVE_APPROVAL.READ}>
                  <FeatureGuard
                    flag={enableLeave}
                    redirectTo={defaultRedirectTo}
                  >
                    <LeaveApproval />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "leave-calendar",
              element: (
                <ProtectedRoute requiredPermission={LEAVE_CALENDAR.READ}>
                  <FeatureGuard
                    flag={enableLeave}
                    redirectTo={defaultRedirectTo}
                  >
                    <LeaveCalendarAdmin />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
          ],
        },
        {
          path: "/roles/add",
          element: (
            <ProtectedRoute requiredPermission={ROLE.CREATE}>
              <RoleDetails isAdd={true} />
            </ProtectedRoute>
          ),
        },
        {
          path: "/roles/edit/:id",
          element: (
            <ProtectedRoute requiredPermission={ROLE.EDIT}>
              <RoleDetails />
            </ProtectedRoute>
          ),
        },
        {
          path: "/roles",
          element: (
            <ProtectedRoute requiredPermission={ROLE.READ}>
              <RolesPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/company-policy",
          element: (
            <ProtectedRoute requiredPermission={COMPANY_POLICY.READ}>
              <CompanyPolicyPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/company-policy/view/:id",
          element: (
            <ProtectedRoute requiredPermission={COMPANY_POLICY.VIEW}>
              <CompanyPolicyDetailPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/company-policy/edit/:id",
          element: (
            <ProtectedRoute requiredPermission={COMPANY_POLICY.EDIT}>
              <EditCompanyPolicyPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/company-policy/add",
          element: (
            <ProtectedRoute requiredPermission={COMPANY_POLICY.CREATE}>
              <EditCompanyPolicyPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/employees/employee-list",
          element: (
            <ProtectedRoute requiredPermission={EMPLOYEES.READ}>
              <EmployeeListPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/employees/Employee-list/add",
          element: (
            <ProtectedRoute requiredPermission={EMPLOYEES.CREATE}>
              <AddEmployeePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/employees/employee-exit",
          element: (
            <ProtectedRoute
              requiredPermission={EMPLOYEES.READ}
              requiredRoles={[role.SUPER_ADMIN]}
            >
              <FeatureGuard
                flag={enableExitEmployee}
                redirectTo={defaultRedirectTo}
              >
                <ExitEmployeeListPage />
              </FeatureGuard>
            </ProtectedRoute>
          ),
        },
        {
          path: "/employees/employee-exit/:resignationId",
          element: (
            <ProtectedRoute
              requiredPermission={EMPLOYEES.READ}
              requiredRoles={[role.SUPER_ADMIN]}
            >
              <FeatureGuard
                flag={enableExitEmployee}
                redirectTo={defaultRedirectTo}
              >
                <ExitDetailsPage />
              </FeatureGuard>
            </ProtectedRoute>
          ),
        },
        {
          path: "/attendance/my-attendance",
          element: (
            <ProtectedRoute requiredPermission={Attendance_Details.READ}>
              <FeatureGuard
                flag={enableAttendance}
                redirectTo={defaultRedirectTo}
              >
                <AttendancePage />
              </FeatureGuard>
            </ProtectedRoute>
          ),
        },
        {
          path: "/attendance/attendance-configuration",
          element: (
            <ProtectedRoute requiredPermission={ATTENDANCE_CONFIGURATION.READ}>
              <FeatureGuard
                flag={enableAttendance}
                redirectTo={defaultRedirectTo}
              >
                <AttendanceConfigurationPage />
              </FeatureGuard>
            </ProtectedRoute>
          ),
        },
        {
          path: "/attendance/Employee-Report",
          element: (
            <ProtectedRoute
              requiredPermission={ATTENDANCE_EMPLOYEE_REPORT.READ}
            >
              <FeatureGuard
                flag={enableAttendance}
                redirectTo={defaultRedirectTo}
              >
                <AttendanceEmployeeReportPage />
              </FeatureGuard>
            </ProtectedRoute>
          ),
        },
        {
          path: "/events",
          element: (
            <ProtectedRoute requiredPermission={EVENTS.READ}>
              <EventsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/events/add",
          element: (
            <ProtectedRoute requiredPermission={EVENTS.CREATE}>
              <EditEventsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/events/view/:id",
          element: (
            <ProtectedRoute requiredPermission={EVENTS.VIEW}>
              <EventDetailPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/events/edit/:id",
          element: (
            <ProtectedRoute requiredPermission={EVENTS.EDIT}>
              <EditEventsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/employment-details/edit/:id",
          element: (
            <ProtectedRoute
              requiredPermission={EMPLOYEES.EDIT && EMPLOYMENT_DETAILS.READ}
            >
              <EditEmploymentDetails />
            </ProtectedRoute>
          ),
        },
        {
          path: "/settings/department",
          element: (
            <ProtectedRoute
              requiredPermission={EMPLOYMENT_DETAILS.READ}
              requiredRoles={[role.SUPER_ADMIN]}
            >
              <Department />
            </ProtectedRoute>
          ),
        },
        {
          path: "/settings/designation",
          element: (
            <ProtectedRoute
              requiredPermission={EMPLOYMENT_DETAILS.READ}
              requiredRoles={[role.SUPER_ADMIN]}
            >
              <Designation />
            </ProtectedRoute>
          ),
        },
        {
          path: "/settings/team",
          element: (
            <ProtectedRoute
              requiredPermission={EMPLOYMENT_DETAILS.READ}
              requiredRoles={[role.SUPER_ADMIN]}
            >
              <Team />
            </ProtectedRoute>
          ),
        },
        {
          path: "/settings/email-and-notification",
          element: (
            <ProtectedRoute
              requiredPermission={EMPLOYMENT_DETAILS.READ}
              requiredRoles={[role.SUPER_ADMIN]}
            >
              <EmailTable />
            </ProtectedRoute>
          ),
        },
        {
          path: "/settings/email-and-notification/edit/:id",
          element: (
            <ProtectedRoute
              requiredPermission={EMPLOYMENT_DETAILS.READ}
              requiredRoles={[role.SUPER_ADMIN]}
            >
              <EmailTemplates mode="edit" />
            </ProtectedRoute>
          ),
        },
        {
          path: "/settings/email-and-notification/add",
          element: (
            <ProtectedRoute
              requiredPermission={EMPLOYMENT_DETAILS.READ}
              requiredRoles={[role.SUPER_ADMIN]}
            >
              <EmailTemplates mode="add" />
            </ProtectedRoute>
          ),
        },
        {
          path: "/settings/user-guides",
          element: <UserGuideListPage />,
        },
        {
          path: "/settings/user-guides/add",
          element: <UpsertUserGuide mode={FormMode.Create} />,
        },
        {
          path: "/settings/user-guides/:userGuideId/edit",
          element: <UpsertUserGuide mode={FormMode.Edit} />,
        },
        {
          path: "/IT-Assets",
          element: (
            <ProtectedRoute requiredPermission={ASSET_DETAILS.READ}>
              <FeatureGuard flag={enableITAsset} redirectTo={defaultRedirectTo}>
                <ItAssetPage />
              </FeatureGuard>
            </ProtectedRoute>
          ),
        },
        {
          path: "/IT-Assets/add",
          element: (
            <ProtectedRoute requiredPermission={ASSET_DETAILS.CREATE}>
              <FeatureGuard flag={enableITAsset} redirectTo={defaultRedirectTo}>
                <AddITAssetPage />
              </FeatureGuard>
            </ProtectedRoute>
          ),
        },
        {
          path: "/IT-Assets/:assetId",
          element: (
            <ProtectedRoute requiredPermission={ASSET_DETAILS.READ}>
              <FeatureGuard flag={enableITAsset} redirectTo={defaultRedirectTo}>
                <AssetDetailsLayout />
              </FeatureGuard>
            </ProtectedRoute>
          ),
          children: [
            { index: true, element: <Navigate to="general" replace /> },
            { path: "general", element: <AssetGeneralPage /> },
            { path: "history", element: <HistoryTable /> },
          ],
        },
        {
          path: "/developer/logs",
          element: (
            <ProtectedRoute requiredPermission={DEVELOPER_LOGS.READ}>
              <DeveloperLogsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/developer/logs/:id",
          element: (
            <ProtectedRoute requiredPermission={DEVELOPER_LOGS.READ}>
              <DeveloperLogDetailsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "/developer/cron-jobs",
          element: (
            <ProtectedRoute requiredPermission={DEVELOPER_LOGS.READ}>
              <CronJobsPage />
            </ProtectedRoute>
          ),
        },
        {
          path: "KPI",
          children: [
            {
              path: "my-KPI",
              element: (
                <ProtectedRoute requiredPermission={KPI.READ}>
                  <FeatureGuard flag={enableKPI} redirectTo={defaultRedirectTo}>
                    <EmployeeKPI />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "Kpi-Details/:employeeId",
              element: (
                <ProtectedRoute requiredPermission={KPI.VIEW}>
                  <FeatureGuard flag={enableKPI} redirectTo={defaultRedirectTo}>
                    <KpiDetails />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "Goals",
              element: (
                <ProtectedRoute requiredPermission={KPI_GOALS.READ}>
                  <FeatureGuard flag={enableKPI} redirectTo={defaultRedirectTo}>
                    <GoalPage />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "Goals/Add-Goal",
              element: (
                <ProtectedRoute requiredPermission={KPI.CREATE}>
                  <FeatureGuard flag={enableKPI} redirectTo={defaultRedirectTo}>
                    <UpsertGoalsPage mode="add" />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "Goals/Edit-Goal/:id",
              element: (
                <ProtectedRoute requiredPermission={KPI.EDIT}>
                  <FeatureGuard flag={enableKPI} redirectTo={defaultRedirectTo}>
                    <UpsertGoalsPage mode="edit" />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "KPI-Management",
              element: (
                <ProtectedRoute requiredPermission={KPI_DASHBOARD.READ}>
                  <FeatureGuard flag={enableKPI} redirectTo={defaultRedirectTo}>
                    <EmployeeGoalsPage />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
          ],
        },
        {
          path: "grievance",
          children: [
            {
              path: "grievance-configuration",
              element: (
                <ProtectedRoute
                  requiredPermission={GRIEVANCE_CONFIGURATION.READ}
                >
                  <FeatureGuard
                    flag={enableGrievance}
                    redirectTo={defaultRedirectTo}
                  >
                    <GrievanceDashboard />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "grievance-configuration/add-grievance",
              element: (
                <ProtectedRoute
                  requiredPermission={GRIEVANCE_CONFIGURATION.READ}
                >
                  <FeatureGuard
                    flag={enableGrievance}
                    redirectTo={defaultRedirectTo}
                  >
                    <UpsertGrievanceType mode="add" />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "grievance-configuration/edit-grievance/:id",
              element: (
                <ProtectedRoute
                  requiredPermission={GRIEVANCE_CONFIGURATION.READ}
                >
                  <FeatureGuard
                    flag={enableGrievance}
                    redirectTo={defaultRedirectTo}
                  >
                    <UpsertGrievanceType mode="edit" />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "my-grievance",
              element: (
                <ProtectedRoute requiredPermission={GRIEVANCE.READ}>
                  <FeatureGuard
                    flag={enableGrievance}
                    redirectTo={defaultRedirectTo}
                  >
                    <EmployeeGrievanceListPage />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "my-grievance/add-grievance",
              element: (
                <ProtectedRoute requiredPermission={GRIEVANCE.CREATE}>
                  <FeatureGuard
                    flag={enableGrievance}
                    redirectTo={defaultRedirectTo}
                  >
                    <AddGrievancePage />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "all-grievance",
              element: (
                <ProtectedRoute requiredPermission={GRIEVANCE_DASHBOARD.READ}>
                  <FeatureGuard
                    flag={enableGrievance}
                    redirectTo={defaultRedirectTo}
                  >
                    <GrievanceAdminPage />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
            {
              path: "tickets/:ticketId",
              element: (
                <ProtectedRoute requiredPermission={GRIEVANCE.VIEW}>
                  <FeatureGuard
                    flag={enableGrievance}
                    redirectTo={defaultRedirectTo}
                  >
                    <GrievanceTicketPage />
                  </FeatureGuard>
                </ProtectedRoute>
              ),
            },
          ],
        },
        {
          path: "/Support",

          children: [
            {
              path: "Support-Queries",
              element: (
                <ProtectedRoute requiredPermission={SUPPORT_DASHBOARD.READ}>
                  <FeedBackAdminPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "Support-Details/:requestId",
              element: (
                <ProtectedRoute requiredPermission={SUPPORT.READ}>
                  <FeedBackDetailPage />
                </ProtectedRoute>
              ),
            },
            {
              path: "My-Support",
              element: (
                <ProtectedRoute requiredPermission={SUPPORT.READ}>
                  <EmployeeFeedBackListPage />
                </ProtectedRoute>
              ),
            },
          ],
        },
        {
          path: "/resignation-form/:userId?",
          element: (
            <FeatureGuard
              flag={enableExitEmployee}
              redirectTo={defaultRedirectTo}
            >
              <ResignationFormPage />
            </FeatureGuard>
          ),
        },
        {
          path: "/internal-login",
          element: <InternalUserLogin />,
        },
        {
          path: "/unauthorized",
          element: <Unauthorized />,
        },
        {
          path: "*",
          element: <NotFoundPage />,
        },
      ],
    },
  ];

  const router = createBrowserRouter(getRoutes());

  return <RouterProvider router={router} />;
};

export default CustomRoute;
