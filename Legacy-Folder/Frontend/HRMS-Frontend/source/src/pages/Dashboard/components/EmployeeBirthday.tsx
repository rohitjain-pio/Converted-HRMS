import '@/pages/Dashboard/components/EmployeeBirthday.css';
import cakeIcon from '@/assets/images/icons/cake-icon.png';
import defaultIcon from '@/assets/images/icons/no-photo.jpg';
import { EmployeeBirthdayProps, IEmployeeBirthday } from '@/services/Dashboard';
import { Box, CircularProgress, styled, Typography } from '@mui/material';
import moment from 'moment';
import { SyntheticEvent } from 'react';
import Tooltip from '@mui/material/Tooltip';

const StyledDataBox = styled(Box)(() => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "3px",
    border: "1px solid #e3e7eb",
    borderRadius: "5px",
    margin: "5px 0",
    backgroundColor: "rgba(255,255,255,0.5019607843137255)",
    minHeight: "64px",
    ".employee-info": {
        minWidth: 0
    },
    ".employee-name": {
        fontSize: "16px",
        color: "#273A50",
        fontWeight: 400,
        fontFamily: "Roboto",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    ".employee-birthday":{
        fontSize: "12px",
        color: "#6d6d6d",
        fontWeight: 400,
        fontFamily: "Roboto"
    },
    ".employee-pic": {
        width: "40px",
        height: "40px",
        margin: "0px 10px",
    },
    ".birthday-icon":{
        width: "24px",
        height: "24px",
        marginRight: "10px"
    },
    "&:hover": {
        background: "#F6F9FC"
    }
}));

const EmployeeBirthday: React.FC<EmployeeBirthdayProps> = ({ isLoading, birthdayList }) => {
    const getFullName = ({ firstName, middleName, lastName }: IEmployeeBirthday) => {
        const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim()
        return fullName;
    };

    const handleImageError = (e: SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.currentTarget;
        target.onerror = null;
        target.src = defaultIcon;
      };

    return (
        <div>
            {isLoading ? (
                <div className="loading-spinner">
                    <CircularProgress />
                </div>
            ) : (
                birthdayList.map((employee) => (
                    <StyledDataBox key={employee.id}>
                        <img
                            src={employee.profileImagePath || defaultIcon}
                            title={getFullName(employee)}
                            alt={`${employee.firstName}'s profile`}
                            className="employee-pic"
                            onError={handleImageError}
                        />
                        <div className="employee-info">
                            <Tooltip title={getFullName(employee)} followCursor>
                                <Typography className="employee-name">{getFullName(employee)}</Typography>
                            </Tooltip>
                            <Typography className="employee-birthday">
                                {moment(employee.dob).format("MMM Do")}
                            </Typography>
                        </div>
                        <img
                            title="Birthday Cake"
                            src={cakeIcon}
                            alt="Birthday Icon"
                            className="birthday-icon"
                        />
                    </StyledDataBox>
                ))
            )}
        </div>
    );
};

export default EmployeeBirthday;
