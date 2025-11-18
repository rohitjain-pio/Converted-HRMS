using HRMS.Domain.Enums;

namespace HRMS.Models.Models.Employees
{
    public class IsResignationExistResponseDTO
    {
        public int ResignationId { get; set; }
     
        public ResignationStatus ResignationStatus { get; set; }
           
    }
}
