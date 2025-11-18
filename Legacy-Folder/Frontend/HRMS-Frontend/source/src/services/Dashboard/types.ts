export interface GetEmployeeCountParams {
    from: string;
    to: string;
    days?: number;
}

export interface GetEmployeeCountResponse {
    statusCode: number;
    message: string;
    modelErrors: string[];
    result: IEmployeeCount;
}

export interface IEmployeeCount {
    activeEmployeeCount: number;
    newEmployeeCount: number;
    exitOrgEmployeeCount: number;
}

export interface GetBirthdayResponse {
    statusCode: number;
    message: string;
    modelErrors: string[];
    result: IEmployeeBirthday[];
}

export interface IEmployeeBirthday {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    profileImagePath: string;
    dob: string;
}

export interface EmployeeBirthdayProps {
    isLoading: boolean;
    birthdayList: IEmployeeBirthday[];
}

export interface GetWorkAnniversaryResponse {
    statusCode: number;
    message: string;
    modelErrors: string[];
    result: IWorkAnniversary[];
}

export interface IWorkAnniversary {
    id: number;
    firstName: string;
    middleName: string;
    lastName: string;
    joiningDate: string;
    profilePicPath: string;
}

export interface WorkAnniversaryProps {
    isLoading: boolean;
    workAnniversaries: IWorkAnniversary[];
}

export interface GetUpcomingEventsResult {
    id: number,
    eventName: string,
    bannerFileName: string,
    startDate: string,
    status: string,
    venue: string
}

export interface GetUpcomingEventsResponse {
    statusCode: number;
    message: string;
    result: null | GetUpcomingEventsResult[];
}

export interface UpcomingEventProps {
    isLoading: boolean;
    upcomingEvents: GetUpcomingEventsResult[];
}

export interface ICompanyPolicyDocument {
    id: number;
    name: string;
    updatedOn: string;
}

export interface GetPublishedCompanyPoliciesParams {
    from: string;
    to: string;
    days?: number;
}

export interface GetPublishedCompanyPoliciesResponse {
    statusCode: number;
    message: string;
    result: null | ICompanyPolicyDocument[];
}

export interface CompanyPolicyDocumentProps {
    isLoading: boolean;
    companyPolicyDocuments: ICompanyPolicyDocument[];
}

export interface IEmployeeSurvey {
    id: number;
    title: string;
}

export interface EmployeeSurveyProps {
    employeeSurveyList: IEmployeeSurvey[];
}

export interface GetHolidayResponse {
    statusCode: number;
    message: string;
    modelErrors: string[];
    result: {
        india: IHoliday[];
        usa: IHoliday[];
    };
}

export interface IHoliday {
    date: string,
    day: string,
    location: string,
    title: string
}

export interface HolidayCalendarProps {
    isLoading: boolean;
    holidays: IHoliday[];
}
