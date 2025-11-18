export interface User {
  id: number;
  email: string;
  name: string;
  role: number;
  employee_code?: string;
}

export interface EmployeeData {
  id: number;
  first_name: string;
  middle_name?: string;
  last_name: string;
  father_name?: string;
  personal_email?: string;
  phone?: string;
  employee_code?: string;
  status?: number;
}

export interface EmploymentDetail {
  id: number;
  employee_id: number;
  email: string;
  role_id: number;
  designation?: string;
  department?: string;
  joining_date?: string;
}
