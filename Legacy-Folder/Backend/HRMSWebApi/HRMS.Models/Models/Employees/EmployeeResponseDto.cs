using HRMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Employees
{
    public class EmployeeResponseDto
    {
        public int SlNo { get; set; }
        public int Id { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeName { get; set; }
        public string FatherName { get; set; }
        public Gender Gender { get; set; }
        public DateTime DOB { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
        public string PermanentAddress { get; set; }
        public string CityName { get; set; }
        public string StateName { get; set; }
        public string PinCode { get; set; }
        public string Country { get; set; }
        public string EmergencyContactNo { get; set; }
        public DateTime JoiningDate { get; set; }
        public DateTime ConfirmationDate { get; set; }
        public JobType JobType { get; set; }
        public int Branch { get; set; }
        public string PFNumber { get; set; }
        public DateTime PFDate { get; set; }
        public string BankName { get; set; }
        public string AccountNo { get; set; }
        public string PANNumber { get; set; }
        public string ESINo { get; set; }
        public string DepartmentName { get; set; }
        public string Designation { get; set; }
        public string ReportingManagerName { get; set; }
        public string PassportNo { get; set; }
        public DateTime PassportExpiry { get; set; }
        public string AlternatePhone { get; set; }
        public string Phone { get; set; }
        public string PersonalEmail { get; set; }
        public string BloodGroup { get; set; }
        public MaritalStatus MaritalStatus { get; set; }
        public string UANNo { get; set; }
        public bool HasPF { get; set; }
        public bool HasESI { get; set; }
        public string AdharNumber { get; set; }
        public string Status { get; set; }
    }
}
