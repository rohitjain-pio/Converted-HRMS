import DashboardIcon from "@mui/icons-material/Dashboard";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArticleIcon from "@mui/icons-material/Article";
import GroupsIcon from "@mui/icons-material/Groups";
import EventIcon from "@mui/icons-material/Event";
import SettingsIcon from "@mui/icons-material/Settings";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { MenuGroupConfig } from ".";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DeveloperBoardIcon from "@mui/icons-material/DeveloperBoard";
import AssessmentIcon from "@mui/icons-material/Assessment";
import FeedbackIcon from "@mui/icons-material/Feedback";
import DevicesIcon from "@mui/icons-material/Devices";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

import { role } from "@/utils/constants";

const dashboard: MenuGroupConfig = {
  id: "group-dashboard",
  title: "",
  type: "group",
  children: [
    {
      id: "dashboard",
      title: "Dashboard",
      type: "item",
      url: "/dashboard",
      icon: DashboardIcon,
      breadcrumbs: false,
    },
    {
      id: "roles",
      title: "Roles",
      type: "item",
      url: "/roles",
      icon: AdminPanelSettingsIcon,
      breadcrumbs: true,
    },
    {
      id: "company-policy",
      title: "Company Policy",
      type: "item",
      url: "/company-policy",
      icon: ArticleIcon,
      breadcrumbs: true,
    },
    {
      id: "employees-menu",
      title: "Employees",
      type: "submenu",
      url: "/employees",
      icon: GroupsIcon,
      breadcrumbs: true,
      children: [
        {
          id: "employees-list",
          title: "Employees List",
          type: "item",
          url: "/employees/employee-list",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "employees-exit",
          title: "Employee Exit",
          type: "item",
          roles: [role.SUPER_ADMIN],
          url: "/employees/employee-exit",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
      ],
    },
    {
      id: "attendance",
      title: "Attendance",
      type: "submenu",
      url: "/attendance",
      icon: CalendarMonthIcon,
      breadcrumbs: true,
      children: [
        {
          id: "attendanceReport",
          title: "My Attendance",
          type: "item",
          url: "/attendance/my-attendance",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "attendanceConfiguration",
          title: "Attendance Configuration",
          type: "item",
          url: "/attendance/attendance-configuration",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "EmployeeAttendanceReport",
          title: "Employee Report",
          type: "item",
          url: "/attendance/employee-report",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
      ],
    },
    {
      id: "it-assets",
      title: "IT Assets",
      type: "item",
      url: "/IT-Assets",
      icon: DevicesIcon,
      breadcrumbs: true,
    },
    {
      id: "leave",
      title: "Leave",
      type: "submenu",
      url: "/leave",
      icon: EventAvailableIcon,
      breadcrumbs: true,
      children: [
        {
          id: "applyLeave",
          title: "Apply Leave",
          type: "item",
          url: "/leave/apply-leave",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "leaveApproval",
          title: "Leave Approval",
          type: "item",
          url: "/leave/leave-approval",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "leaveCalendar",
          title: "Leave Calendar",
          type: "item",
          url: "/leave/leave-calendar",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
      ],
    },
    {
      id: "kpi",
      title: "KPI",
      type: "submenu",
      url: "/Kpi",
      icon: AssessmentIcon,
      breadcrumbs: true,
      children: [
        {
          id: "myKPI",
          title: "My KPI",
          type: "item",
          url: "/KPI/My-KPI",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "kpiManagement",
          title: "KPI Management",
          type: "item",
          url: "/KPI/KPI-Management",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "kpiGoals",
          title: "Goals",
          type: "item",
          url: "/KPI/Goals",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
      ],
    },
    {
      id: "grievance",
      title: "Grievance",
      type: "submenu",
      url: "/Grievance",
      icon: FeedbackIcon,
      breadcrumbs: true,
      children: [
        {
          id: "myGrievance",
          title: "My Grievance",
          type: "item",
          url: "/Grievance/My-Grievance",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "allGrievance",
          title: "All Grievance",
          type: "item",
          url: "/Grievance/All-Grievance",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "grievanceConfiguration",
          title: "Grievance Configuration",
          type: "item",
          url: "/Grievance/Grievance-Configuration",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
      ],
    },
    {
      id: "support",
      title: "Support",
      type: "submenu",
      url: "/Support",
      icon: SupportAgentIcon,
      breadcrumbs: true,
      children: [
        {
          id: "mySupport",
          title: "My Support",
          type: "item",
          url: "/Support/My-Support",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "allSupport",
          title: "Support Queries",
          type: "item",
          url: "/Support/Support-Queries",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
       
      ],
    },
    {
      id: "events",
      title: "Events",
      type: "item",
      url: "/events",
      icon: EventIcon,
      breadcrumbs: true,
    },
    {
      id: "settings",
      title: "Settings",
      type: "submenu",
      url: "/settings",
      icon: SettingsIcon,
      breadcrumbs: true,
      roles: [role.SUPER_ADMIN],
      children: [
        {
          id: "emailsAndNotifications",
          title: "Email and Notification",
          type: "item",
          url: "/settings/email-and-notification",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "departments",
          title: "Department",
          type: "item",
          url: "/settings/department",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "designations",
          title: "Designation",
          type: "item",
          url: "/settings/designation",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "teams",
          title: "Team",
          type: "item",
          url: "/settings/team",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
      ],
    },
    {
      id: "developer",
      title: "Developer",
      type: "submenu",
      url: "/developer",
      icon: DeveloperBoardIcon,
      breadcrumbs: true,
      // roles: [role.SUPER_ADMIN],
      children: [
        {
          id: "developerLogs",
          title: "Logs",
          type: "item",
          url: "/developer/logs",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
        {
          id: "cronJobs",
          title: "Cron Jobs",
          type: "item",
          url: "/developer/cron-jobs",
          icon: ArrowForwardIcon,
          breadcrumbs: true,
        },
      ],
    },
  ],
};

export default dashboard;
