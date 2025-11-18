import { useEffect, useState } from 'react'
import useAsync from '@/hooks/useAsync';
import { getAccrualsUtilized } from '@/services/LeaveManagment/leaveManagmentService';
import { GetAccrualsUtilizedRequest, GetAccrualsUtilizedResponse, AccrualsUtilizedItem } from '@/services/LeaveManagment/types';
import DataTable from '@/components/DataTable/DataTable';
import methods from '@/utils';
import moment from 'moment';
import PageHeader from '@/components/PageHeader/PageHeader';
import { Box, Paper } from '@mui/material';
import { useForm, FormProvider } from 'react-hook-form';
import FormDatePicker from '@/components/FormDatePicker';
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import RoundActionIconButton from '@/components/RoundActionIconButton/RoundActionIconButton';
import SearchIcon from '@mui/icons-material/Search';
import ResetButton from '@/components/ResetButton/ResetButton';
import { useParams } from 'react-router-dom';

const validationSchema = Yup.object().shape({
  date: Yup.mixed(), 
});
type AccuralLeaveProps={
leaveId:number
}
export const AccuralLeave = ({leaveId}:AccuralLeaveProps) => {
   
    const {id}=useParams();

    const [sortColumnName, setSortColumnName] = useState<string>('date');
    const [sortDirection, setSortDirection] = useState<string>('desc');
    const [startIndex, setStartIndex] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [rows, setRows] = useState<AccrualsUtilizedItem[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const headerCells = [
        { label: 'Date', accessor: 'date', width: '90px' },
        { label: 'Description', accessor: 'description', width: '140px',maxLength:80 },
        { label: 'Accrued', accessor: 'accrued', width: '100px' },
        { label: 'Utilized/Rejected', accessor: 'utilizedOrRejected', width: '80px' },
        { label: 'Closing Balance', accessor: 'closingBalance', width: '60px' },
    ];

    const method = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            date: selectedDate ? moment(selectedDate).toDate() : undefined,
        },
    });
    const {   handleSubmit, reset } = method;
    

    const { execute } = useAsync<GetAccrualsUtilizedResponse, { id: string; payload: GetAccrualsUtilizedRequest }>({
        requestFn: async () => {
            const formattedDate = selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : null;
            const payload = {
                sortColumnName,
                sortDirection,
                startIndex: startIndex,
                pageSize,
                filters: { date: formattedDate,leaveId },
            };
            return await getAccrualsUtilized(String(id), payload);
        },
        onSuccess: (response) => {
            setRows(response.data.result.result || []);
            setTotalRecords(response.data.result.totalCount || 0);
        },
        onError: (err) => {
            methods.throwApiError(err);
        },
        autoExecute: false,
    });

    useEffect(() => {
        execute();
    }, [sortColumnName, sortDirection, startIndex, pageSize,selectedDate]);

    const onSubmit = (_data: { date?: Date }) => {
       setSelectedDate(_data.date ? moment(_data.date).toDate() : null);
       
    };

    const handleReset = () => {
        reset({ date: undefined });
        setSelectedDate(null);
        setStartIndex(1);
        setPageSize(10);
      
    };

    

    return (
        <Paper elevation={3} sx={{ p: 2 }}>
            <FormProvider {...method}>
                <Box sx={{ mb: 2 }}>
                    <PageHeader
                     variant="h2"
                     hideBorder={true}
                        title="Accruals and Utilization"
                        actionButton={
                            <Box
                                component="form"
                                onSubmit={handleSubmit(onSubmit)}
                                sx={{
                                    display: "flex",
                                    gap: 1,
                                    alignItems: "center",
                                    flexWrap: { xs: "wrap", sm: "nowrap" },
                                }}
                            >
                                <FormDatePicker
                                    label="Date"
                                    name="date"
                                    value={selectedDate ? moment(selectedDate) : null}
                                   
                                />
                                <RoundActionIconButton
                                    label="Search"
                                    type="submit"
                                    size="small"
                                    icon={<SearchIcon />}
                                />
                                <ResetButton onClick={handleReset}  size="small" isIcon={true} />
                            </Box>
                        }
                    />
                </Box>
                <DataTable
                    data={rows}
                    headerCells={headerCells}
                    setSortColumnName={setSortColumnName}
                    setSortDirection={setSortDirection}
                    setStartIndex={setStartIndex}
                    startIndex={startIndex}
                    setPageSize={setPageSize}
                    pageSize={pageSize}
                    totalRecords={totalRecords}
                />
            </FormProvider>
        </Paper>
    );
}
