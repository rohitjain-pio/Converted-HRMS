import { SetStateAction, useEffect, useMemo, useState } from "react";
import EmployeeSurvey from "@/pages/Dashboard/components/EmployeeSurvey";
import UpcomingEvents from "@/pages/Dashboard/components/UpcomingEvents";
import EmployeeBirthday from "@/pages/Dashboard/components/EmployeeBirthday";
import { dayOptions, employeeSurveyList, TileData } from "@/pages/Dashboard/dashboardConstants";
import employeeIcon from "@/assets/images/icons/EmployeeIcon.svg";

import { Grid, SelectChangeEvent, Typography } from "@mui/material";
import { useDashboardData } from "@/pages/Dashboard/components/useDashboardData";
import WorkAnniversary from "@/pages/Dashboard/components/WorkAnniversary";
import UpcommingHolidayCalendar from "@/pages/Dashboard/components/UpcommingHolidayCalendar";
import CompanyPolicyDocument from "@/pages/Dashboard/components/CompanyPolicyDocument";
import { GroupRemove, PostAdd } from "@mui/icons-material";
import DayDropdown from "@/pages/Dashboard/components/DayDropdown";
import AnalyticsSection from "@/pages/Dashboard/components/AnalyticsSection";
import DashboardTile from "@/pages/Dashboard/components/DashboardTile";
import moment from "moment";
import CustomDatePicker from "@/pages/Dashboard/components/CustomDatePicker";
import NoDataFound from "@/components/NoDataFound";
import { useUserStore } from "@/store";
import { FEATURE_FLAGS, permissionValue, role } from "@/utils/constants";
import ApplyNew from "@/pages/Dashboard/components/ApplyNew";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { hasPermission } from "@/utils/hasPermission";

const { COMPANY_POLICY, EVENTS } = permissionValue;

const DashboardDefault = () => {
  const { userData } = useUserStore();
  const [daySelectedValue, setDaySelectedValue] = useState(7);
  const [isCustomDayRange, setIsCustomDayRange] = useState(false);
  const [customDayRangeError, setCustomDayRangeError] = useState(false);
  const [customDayRangeMessage, setCustomDayRangeMessage] =
    useState<string>("");
  const [startDate, setStartDate] = useState<moment.Moment | null>(null);
  const [endDate, setEndDate] = useState<moment.Moment | null>(null);
  const [isSubmit, setisSubmit] = useState(false);
  const [isCustomRangeApplied, setIsCustomRangeApplied] = useState(false);

  const calculateFromToDates = () => {
    let toDate = moment();
    let fromDate = toDate.clone().subtract(daySelectedValue - 1, "days"); // Subtract 1 to make fromDate inclusive

    if (startDate && endDate) {
      toDate = endDate;
      fromDate = startDate;
    }

    return {
      from: fromDate.format("YYYY-MM-DD"),
      to: toDate.format("YYYY-MM-DD"),
      days: daySelectedValue,
    };
  };

  const { from, to, days } = useMemo(
    () => calculateFromToDates(),
    [daySelectedValue, startDate, endDate]
  );
  const {
    dashboardData,
    isEmployeeCountLoading,
    isBirthdayLoading,
    isWorkAnniversaryLoading,
    isHolidayLoading,
    isUpcomingHolidaysLoading,
    isUpcomingEventsLoading,
    isPublishedCompanyPoliciesLoading,
    handleFlagChange,
    holidayCalendarFlag,
  } = useDashboardData(
    from,
    to,
    days,
    isSubmit,
    setisSubmit,
    isCustomDayRange,
    true,
    true,
    true,
    true,
    true
  );

  const handleDayChange = (event: SelectChangeEvent<number>) => {
    if (event.target.value !== -1) {
      setDaySelectedValue(event.target.value as number);
      setCustomDayRangeMessage("");
      setCustomDayRangeError(false);
      setStartDate(null);
      setEndDate(null);
      setIsCustomRangeApplied(false);
    } else {
      setIsCustomDayRange(true);
    }
  };
  const handleCustomDayChange = () => {
    setisSubmit(true);
    if (startDate !== null && endDate !== null) {
      setIsCustomRangeApplied(true);
      setCustomDayRangeMessage(
        `${moment(startDate).format("MMM Do,YYYY")} - ${moment(endDate).format("MMM Do, YYYY")}`
      );
      const startD = startDate;
      const endD = endDate;
      const diffDays = endD.diff(startD, "days") + 1;
      setDaySelectedValue(diffDays);
      setIsCustomDayRange(false);
    } else {
      setCustomDayRangeError(true);
    }
  };

  const handleCustomDatePickerClose = () => {
    setIsCustomDayRange(false);
    setCustomDayRangeError(false);

    if (!isCustomRangeApplied) {
      setStartDate(null);
      setEndDate(null);
    }
  };

  const componentMap: { [key: number]: JSX.Element } = useMemo(
    () => ({
      0: dashboardData.workAnniversaryData.length ? (
        <WorkAnniversary
          isLoading={isWorkAnniversaryLoading}
          workAnniversaries={dashboardData.workAnniversaryData}
        />
      ) : (
        <NoDataFound />
      ),
      1: dashboardData.filteredUpcomingHolidays.length ? (
        <UpcommingHolidayCalendar
          isLoading={isUpcomingHolidaysLoading}
          holidays={dashboardData.filteredUpcomingHolidays}
        />
      ) : (
        <NoDataFound />
      ),
      2: <ApplyNew />,
      3: dashboardData.birthdayData.length ? (
        <EmployeeBirthday
          isLoading={isBirthdayLoading}
          birthdayList={dashboardData.birthdayData}
        />
      ) : (
        <NoDataFound />
      ),
      4: dashboardData.publishedCompanyPolicies.length ? (
        <CompanyPolicyDocument
          isLoading={isPublishedCompanyPoliciesLoading}
          companyPolicyDocuments={dashboardData.publishedCompanyPolicies}
        />
      ) : (
        <NoDataFound />
      ),
      5: dashboardData.upcomingEvents.length ? (
        <UpcomingEvents
          isLoading={isUpcomingEventsLoading}
          upcomingEvents={dashboardData.upcomingEvents}
        />
      ) : (
        <NoDataFound />
      ),
      6: employeeSurveyList.length ? (
        <EmployeeSurvey employeeSurveyList={employeeSurveyList} />
      ) : (
        <NoDataFound />
      ),
    }),
    [
      dashboardData,
      isBirthdayLoading,
      isWorkAnniversaryLoading,
      isUpcomingHolidaysLoading,
    ]
  );

  const enableAttendance = useFeatureFlag(FEATURE_FLAGS.enableAttendance);
  const enableLeave = useFeatureFlag(FEATURE_FLAGS.enableLeave);

  const enableApplyNew = enableAttendance || enableLeave;

  const tilesData: TileData[] = [
    {
      displaySequence: 0,
      title: "Work Anniversary",
      value: "",
      isShow: true,
      background: 0,
    },
    {
      displaySequence: 1,
      title: "Upcoming Holidays",
      value: "",
      isShow: true,
      background: 1,
    },
    {
      displaySequence: 2,
      title: "Apply New",
      value: "",
      isShow: enableApplyNew,
      background: 2,
    },
    {
      displaySequence: 3,
      title: "Birthdays",
      value: "",
      isShow: true,
      background: 3,
    },
    {
      displaySequence: 4,
      title: "Company Policy Document",
      value: "",
      isShow: hasPermission(COMPANY_POLICY.READ),
      background: 4,
    },
    {
      displaySequence: 5,
      title: "Upcoming Events",
      value: "",
      isShow: hasPermission(EVENTS.READ),
      background: 5,
    },
    // {
    //   displaySequence: 6,
    //   title: "Employee Survey",
    //   value: "",
    //   isShow: true,
    //   background: 6,
    // },
  ];

  const sortedTilesData = useMemo(
    () => tilesData.sort((a, b) => a.displaySequence - b.displaySequence),
    [tilesData]
  );

  const [analyticsData, setAnalyticsData] = useState([
    {
      id: 1,
      title: "Total Active Employees",
      count: 0,
      percentage: 59.3,
      icon: (
        <img
          src={employeeIcon}
          alt="Employee Icon"
          style={{ width: 50, height: 50, background: "transparent" }}
        />
      ),
      background: 0,
    },
    {
      id: 2,
      title: "New Employees Enrolled",
      count: 0,
      percentage: 70.5,
      icon: <PostAdd sx={{ fontSize: 50 }} />,
      background: 1,
    },
    {
      id: 3,
      title: "Employee Exit Organization",
      count: 0,
      percentage: 27.4,
      isLoss: true,
      color: "warning",
      icon: <GroupRemove sx={{ fontSize: 50 }} />,
      background: 2,
    },
  ]);

  const changeEndDate = (newValue: SetStateAction<moment.Moment | null>) => {
    setEndDate(newValue);
  };

  const changeStartDate = (newValue: SetStateAction<moment.Moment | null>) => {
    setStartDate(newValue);
  };

  useEffect(() => {
    if (
      !isEmployeeCountLoading &&
      dashboardData.employeeCount &&
      dashboardData.employeeCount.activeEmployeeCount !== undefined &&
      dashboardData.employeeCount.newEmployeeCount !== undefined &&
      dashboardData.employeeCount.exitOrgEmployeeCount !== undefined
    ) {
      const { activeEmployeeCount, newEmployeeCount, exitOrgEmployeeCount } =
        dashboardData.employeeCount;

      setAnalyticsData((prevData) =>
        prevData.map((item) => {
          if (item.id === 1) {
            return { ...item, count: activeEmployeeCount };
          } else if (item.id === 2) {
            return { ...item, count: newEmployeeCount };
          } else if (item.id === 3) {
            return { ...item, count: exitOrgEmployeeCount };
          }
          return item;
        })
      );
    }
  }, [isEmployeeCountLoading, dashboardData.employeeCount]);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={6} sx={{ mb: -3 }}>
        <Typography variant="h2" sx={{ color: "#273A50" }}>
          Dashboard
        </Typography>
      </Grid>

      <Grid
        item
        xs={6}
        container
        justifyContent="flex-end"
        sx={{ mb: userData.roleName !== role.EMPLOYEE ? -3 : 0 }}
      >
        <DayDropdown
          options={dayOptions}
          selectedValue={daySelectedValue}
          onChange={handleDayChange}
          customLabel={customDayRangeMessage}
        />
        <CustomDatePicker
          open={isCustomDayRange}
          onClose={handleCustomDatePickerClose}
          onConfirm={handleCustomDayChange}
          error={customDayRangeError}
          startDate={startDate}
          endDate={endDate}
          changeStartDate={changeStartDate}
          changeEndDate={changeEndDate}
        />
      </Grid>

      {userData.roleName !== role.EMPLOYEE && (
        <AnalyticsSection data={analyticsData} />
      )}

      {sortedTilesData
        .filter((tile) => tile.isShow)
        .map((tile, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={4}
            key={index}
            style={{ paddingTop: "24px" }}
          >
            <DashboardTile
              title={tile.title}
              value={componentMap[tile.displaySequence] || null}
              flag={holidayCalendarFlag}
              changeFlag={handleFlagChange}
              isLoading={isHolidayLoading}
              holidays={dashboardData.filteredHolidays}
              background={tile.background}
            />
          </Grid>
        ))}
    </Grid>
  );
};

export default DashboardDefault;
