import React from 'react';
import {
    CircularProgress,
} from '@mui/material';
import { HolidayCalendarProps, IHoliday } from '@/services/Dashboard';
import DataTable from '@/components/DataTable/DataTable';
import { formatDate } from '@/utils/formatDate';

  const headerCells = [
    {
      label: "DATE",
      accessor: "date",
      renderColumn: (row: IHoliday) => formatDate(row.date),
      width: "30%",
    },
    {
      label: "REMARKS",
      accessor: "title",
      width: "35%",
      maxLength: 15
    },
    {
      label: "LOCATION",
      accessor: "location",
      width: "35%",
      maxLength: 18
    }
  ];

const UpcommingHolidayCalendar: React.FC<HolidayCalendarProps> = ({ isLoading, holidays }) => {
    return (
        <div className='dashboard-upcoming'>
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

export default UpcommingHolidayCalendar;
