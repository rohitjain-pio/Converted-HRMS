import { Box, Paper } from "@mui/material";
import PageHeader from "@/components/PageHeader/PageHeader";
import TimeInDialog from "@/pages/Attendance/components/TimeInDialog";
import TimeOutDialog from "@/pages/Attendance/components/TimeOutDialog";
import BreadCrumbs from "@/components/@extended/Router";
import { useAttendanceDialogs } from "@/pages/Attendance/Employee/useAttendanceDialogs";
import AttendanceTable from "@/pages/Attendance/components/AttendanceTable/index";

export interface validationProp {
  start: Date | null | undefined;
  end: Date | null | undefined;
}
const AttendancePage = () => {
  const {
    rows,
    openTimeIn,
    setOpenTimeIn,
    openTimeOut,
    setOpenTimeOut,
    timeOutDate,
    getDateStatus,
    handleTimeIn,
    handleTimeOut,
    startIndex,
    setStartIndex,
    pageSize,
    setPageSize,
    setFilterStartDate,
    setFilterEndDate,
    editDetails,
    setEditDetail,
    isManualAttendance,
    totalRecords,
    showTimeInButton,
    isAddLoading,
    isUpdateLoading,
    filledDates,
    getLoading,
  } = useAttendanceDialogs();
  const handleTimeInButton = () => {
    setEditDetail({
      id: 0,
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      note: "",
      reason: "",
      totalHours:""
    });
    setOpenTimeIn(true);
  };

  return (
    <>
      <BreadCrumbs />
      <Paper elevation={3}>
        <Box>
          <PageHeader variant="h2" title="My Attendance" hideBorder={true} />
        </Box>

        <AttendanceTable
          rows={rows}
          startIndex={startIndex}
          pageSize={pageSize}
          setStartIndex={setStartIndex}
          setPageSize={setPageSize}
          totalRecords={totalRecords}
          setOpenTimeIn={setOpenTimeIn}
          setEditDetail={setEditDetail}
          setFilterStartDate={setFilterStartDate}
          setFilterEndDate={setFilterEndDate}
          setOpenTimeOut={setOpenTimeOut}
          isManualAttendance={isManualAttendance}
          showTimeInButton={showTimeInButton}
          handleTimeInButton={handleTimeInButton}
          isLoading={isAddLoading || isUpdateLoading || getLoading}
        />
      </Paper>
      <TimeInDialog
        open={openTimeIn}
        onClose={() => setOpenTimeIn(false)}
        getDateStatus={getDateStatus}
        onSubmit={handleTimeIn}
        isLoading={isAddLoading || isUpdateLoading}
        editDetails={editDetails}
        filledDates={filledDates}
      />
      <TimeOutDialog
        open={openTimeOut}
        onClose={() => setOpenTimeOut(false)}
        timeOutDate={timeOutDate}
        onSubmit={handleTimeOut}
        isLoading={isAddLoading || isUpdateLoading}
      />
    </>
  );
};

export default AttendancePage;
