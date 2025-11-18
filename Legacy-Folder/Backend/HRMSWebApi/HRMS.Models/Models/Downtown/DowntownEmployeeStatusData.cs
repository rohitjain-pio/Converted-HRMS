namespace HRMS.Models.Models.Downtown
{
    public class DowntownEmployeeStatusData
    {
        public List<EmployeeStatus> status { get; set; } = new List<EmployeeStatus>();
    }

    public class EmployeeStatus
    {
        public int Id { get; set; }
        public string title { get; set; } = string.Empty;
    }
}
