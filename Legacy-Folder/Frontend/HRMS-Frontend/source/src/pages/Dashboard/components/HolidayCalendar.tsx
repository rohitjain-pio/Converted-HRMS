import React from 'react';
import {
    CircularProgress,
} from '@mui/material';
import '@/pages/Dashboard/components/HolidayCalendar.css';  
import { HolidayCalendarProps, IHoliday } from '@/services/Dashboard';
import DataTable from '@/components/DataTable/DataTable';
import { formatDate } from '@/utils/formatDate';

  const headerCells = [
    {
      label: "SNO",
      accessor: "sNo",
      width: "50px",
      renderColumn: (_: IHoliday, index: number) => index + 1,
    },
    {
      label: "DATE",
      accessor: "date",
      width: "50px",
      renderColumn: (row: IHoliday) => formatDate(row.date),
    },
    {
        label: "DAY",
        accessor: "day",
        width: "50px",
      },
    {
      label: "REMARKS",
      accessor: "title",
      width: "50px",
    },
    {
      label: "LOCATION",
      accessor: "location",
      width: "50px",
    }
  ];




const HolidayCalendar: React.FC<HolidayCalendarProps> = ({ isLoading, holidays }) => {
    return (
        <div>
            {isLoading ? (
                <div className="loading-spinner">
                    <CircularProgress />
                </div>
            ) : (
                <DataTable
                data={holidays}
                headerCells={headerCells}
                hidePagination
              />
            )}
        </div>
    );
};

export default HolidayCalendar;
