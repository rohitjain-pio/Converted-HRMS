namespace HRMS.Models.Models.Downtown
{
    public class DowntownEmployeeData
    {
        public List<Employee> users{ get; set; } = new List<Employee>();
    }
    public class Employee
    {
        public long id { get; set; }
        public string first_name { get; set; } = string.Empty;
        public string last_name { get; set; } = string.Empty;
        public string photo { get; set; } = string.Empty;
        public int? gender_id { get; set; }
        public string? dob { get; set; }
        public string phone { get; set; } = string.Empty;
        public string alternate_phone_number { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string address { get; set; } = string.Empty;
        public int? country_id { get; set; }
        public string joining_date { get; set; } = string.Empty;
        public int? company_branch_id { get; set; }
        public int? team_id { get; set; }
        public int? designation_id { get; set; }
        public int? status { get; set; }       
        public DateTime created_at { get; set; }
        public DateTime updated_at { get; set; }
        public DateTime? deleted_at { get; set; }
        public StatusData status_data { get; set; }
        public Team team { get; set; }
        public Designation designation { get; set; }
        public GenderData gender_data { get; set; }
        public CountryData country { get; set; }
        public CompanyBranchData company_branch_data { get; set; }
    }

}
