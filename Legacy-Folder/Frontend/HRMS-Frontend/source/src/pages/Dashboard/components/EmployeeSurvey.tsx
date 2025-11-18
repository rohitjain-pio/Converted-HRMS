import { EmployeeSurveyProps } from "@/services/Dashboard";

const EmployeeSurvey: React.FC<EmployeeSurveyProps> = ({ employeeSurveyList}) => {
    return (
        <div>
            {employeeSurveyList?.map((survey, index) => (
                <div key={index}>
                    <h3>{survey.title}</h3>
                </div>
            ))}
        </div>
    );
};

export default EmployeeSurvey;
