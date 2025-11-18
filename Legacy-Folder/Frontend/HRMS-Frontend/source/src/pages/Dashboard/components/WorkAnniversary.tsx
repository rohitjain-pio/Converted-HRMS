import '@/pages/Dashboard/components/WorkAnniversary.css';
import defaultIcon from '@/assets/images/icons/no-photo.jpg';
import { IWorkAnniversary, WorkAnniversaryProps } from '@/services/Dashboard';
import { CircularProgress, Box, Typography, styled } from '@mui/material';
import moment from 'moment';
import trophy from '@/assets/images/icons/work.png';
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
    ".work-anniversary-info": {
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
        width: "30px",
        height: "36px",
    },
    "&:hover": {
        background: "#F6F9FC"
    }
}));

const WorkAnniversary: React.FC<WorkAnniversaryProps> = ({ isLoading, workAnniversaries }) => {
    const getFullName = ({ firstName, middleName, lastName }: IWorkAnniversary) => {
        const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
        return fullName;
    };

    const formatJoiningDate = (dateString: string) => {
        return moment(dateString).format("MMM Do");
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
                workAnniversaries.map((workAnniversary) => {
                    const fullName = getFullName(workAnniversary);

                    return (
                        <StyledDataBox key={workAnniversary.id}>
                            <img
                                src={workAnniversary.profilePicPath || defaultIcon}
                                title={fullName}
                                alt={`${fullName}'s profile`}
                                className="employee-pic"
                                onError={handleImageError}
                            />
                            <div className="work-anniversary-info">
                                <Tooltip title={fullName} followCursor>
                                    <Typography className="employee-name">{fullName}</Typography>
                                </Tooltip>
                                <Typography className="employee-birthday">
                                    {formatJoiningDate(workAnniversary.joiningDate)}
                                </Typography>
                            </div>
                            <img
                                title="Work Anniversary"
                                src={trophy}
                                alt="Work Anniversary"
                                className="birthday-icon"
                            />
                        </StyledDataBox>
                    );
                })
            )}
        </div>
    );
};

export default WorkAnniversary;
