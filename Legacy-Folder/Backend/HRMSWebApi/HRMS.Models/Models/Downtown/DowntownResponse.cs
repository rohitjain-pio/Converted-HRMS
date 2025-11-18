namespace HRMS.Models.Models.Downtown
{
    public class DowntownResponse<T> where T : class
    {
        public bool status { get; set; }
        public string message { get; set; } = string.Empty;
        public T data { get; set; }
    }
}
