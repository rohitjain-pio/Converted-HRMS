// Employee Types - Module 2

// Employment Detail nested object
export interface EmploymentDetail {
  id?: number;
  employee_id?: number;
  email?: string;
  joining_date?: string;
  team_id?: number;
  team_name?: string;
  designation?: string;
  designation_id?: number;
  reporting_manger_id?: number;
  immediate_manager?: string;
  reporting_manager_name?: string;
  reporting_manager_email?: string;
  employment_status?: string;
  employee_status?: string;
  role_id?: number;
  linkedin_url?: string;
  department_id?: number;
  department_name?: string;
  branch_id?: number;
  background_verificationstatus?: string;
  criminal_verification?: string;
  total_experience_year?: number;
  total_experience_month?: number;
  relevant_experience_year?: number;
  relevant_experience_month?: number;
  job_type?: string;
  confirmation_date?: string;
  extended_confirmation_date?: string;
  is_prob_extended?: boolean;
  prob_extended_weeks?: number;
  is_confirmed?: boolean;
  probation_months?: number;
  exit_date?: string;
  is_manual_attendance?: boolean;
  time_doctor_user_id?: string;
  is_reporting_manager?: boolean;
  department?: Department | null;
  designation_model?: Designation | null;
}

export interface Employee {
  id: number;
  employee_code: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  father_name?: string;
  blood_group?: string;
  gender?: number;
  dob?: string;
  phone?: string;
  alternate_phone?: string;
  personal_email?: string;
  password?: string;
  nationality?: string;
  interest?: string;
  marital_status?: number;
  emergency_contact_person?: string;
  emergency_contact_no?: string;
  pan_number?: string;
  adhar_number?: string;
  pf_number?: string;
  esi_no?: string;
  has_esi?: boolean;
  has_pf?: boolean;
  uan_no?: string;
  passport_no?: string;
  passport_expiry?: string;
  pf_date?: string;
  status?: number;
  refresh_token_expiry_date?: string;
  profile_photo?: string;
  file_name?: string;
  file_original_name?: string;
  profile_picture_url?: string; // SAS URL from Azure Blob Storage
  created_by?: string;
  created_on?: string;
  modified_by?: string;
  modified_on?: string;
  is_deleted?: boolean;
  profile_completeness?: number;
  
  // Nested relationships
  employment_detail?: EmploymentDetail;
  current_address?: Address | null;
  permanent_address?: Address | null;
  active_bank_details?: BankDetails | null;
  
  // Legacy/compatibility fields (may be removed)
  email?: string;
  personal_email_old?: string;
  mobile_number?: string;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  pan_no?: string;
  aadhaar_no?: string;
  marriage_date?: string;
  time_doctor_user_id?: string;
  joining_date?: string;
  designation?: string;
  designation_id?: number;
  department?: string;
  department_id?: number;
  team_name?: string;
  team_id?: number;
  reporting_manager_id?: number;
  employment_status?: string;
  job_type?: string;
}

export interface Address {
  id?: number;
  employee_id: number;
  line1?: string;
  line2?: string;
  city_id?: number;
  city_name?: string;
  state_id?: number;
  state_name?: string;
  country_id?: number;
  country_name?: string;
  pincode?: string;
  address_type?: number; // 1=Current, 2=Permanent
}

export interface BankDetails {
  id?: number;
  employee_id: number;
  bank_name?: string;
  account_no?: string;
  masked_account_no?: string;
  branch_name?: string;
  ifsc_code?: string;
  is_active?: number;
}

export interface UserDocument {
  id?: number;
  employee_id: number;
  document_type_id: number;
  document_type?: string;
  document_no?: string;
  document_expiry?: string;
  file_name?: string;
  file_original_name?: string;
  location?: string;
  id_proof_for?: number;
}

export interface Qualification {
  id?: number;
  employee_id: number;
  qualification_id: number;
  qualification_name?: string;
  university_id?: number;
  university_name?: string;
  degree_name?: string;
  college_name?: string;
  aggregate_percentage?: string;
  year_from?: number;
  year_to?: number;
  file_name?: string;
  file_original_name?: string;
  document_url?: string;
}

export interface Certificate {
  id?: number;
  employee_id: number;
  certificate_name: string;
  certificate_expiry?: string;
  file_name?: string;
  file_original_name?: string;
  document_url?: string;
}

export interface Nominee {
  id?: number;
  employee_id: number;
  nominee_name?: string;
  relationship_id?: number;
  relationship_name?: string;
  dob?: string;
  contact_no?: string;
  address?: string;
  percentage?: number;
  nominee_type?: number; // 1=Insurance, 2=PF, 3=Gratuity, 4=All
  is_nominee_minor?: boolean;
}

export interface EmployeeFilters {
  department_id?: number;
  designation_id?: number;
  team_id?: number;
  employment_status?: string;
  search?: string;
}

export interface ProfileCompleteness {
  overall_percentage: number;
  sections: {
    personal_info: number;
    contact_info: number;
    employment_details: number;
    address: number;
    bank_details: number;
    documents: number;
    qualifications: number;
    nominees: number;
  };
}

// Master Data Types
export interface Department {
  id: number;
  name?: string; // From API response
  department?: string; // Direct from database
}

export interface Designation {
  id: number;
  name?: string; // From API response
  designation?: string; // Direct from database
}

export interface Team {
  id: number;
  team_name?: string;   // Original field name
  name?: string;        // API returns this (aliased from 'team_name as name')
}

export interface Country {
  id: number;
  country_name: string;
  country_code: string;
}

export interface State {
  id: number;
  country_id: number;
  state_name: string;
  state_code: string;
}

export interface City {
  id: number;
  state_id: number;
  country_id: number;
  city_name: string;
}

export interface DocumentType {
  id: number;
  document_name: string;
  id_proof_for: number; // 1=ID, 2=Address, 3=Educational, 4=Experience, 5=Other
}

export interface QualificationMaster {
  id: number;
  qualification_name: string;
}

export interface University {
  id: number;
  university_name: string;
}

export interface Relationship {
  id: number;
  relationship_name: string;
}
