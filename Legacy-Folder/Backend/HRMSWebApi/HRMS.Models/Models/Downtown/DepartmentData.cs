namespace HRMS.Models.Models.Downtown
{
    public class DepartmentData
    {
        public List<Department> departments { get; set; } = new List<Department>();
    }
    public class Department 
    {
        public int id { get; set; }
        public string title { get; set; }
    }
}
