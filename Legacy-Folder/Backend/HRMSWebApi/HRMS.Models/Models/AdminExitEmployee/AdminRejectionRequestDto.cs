namespace HRMS.Models.Models.Employees
{
    public class AdminRejectionRequestDto

    {
        public int ResignationId { get; set; }
        public int EmployeeId { get; set; }
        public string RejectionType { get; set; }
        public string? RejectReason { get; set; }
        
        
        
    }
}
