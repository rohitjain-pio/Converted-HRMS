using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models.Models.Employees
{
    public class ImportEmployeesExcelData
    {
        private const int MaxFieldLength50 = 50;
        private const int MaxFieldLength250 = 250;
        private const int MaxFieldLength100 = 100;
        private const int MaxFieldLength10 = 10;
        private const int MaxFieldLength20 = 20;
        private const int MaxFieldLength200 = 200;
        private const int MaxFieldLength150 = 150;

        public int SlNo { get; set; }

        private string? _code;
        public string? Code
        {
            get => _code;
            set => _code = ValidateLength(value, MaxFieldLength20);
        }

        private string? _employeeName;
        public string? EmployeeName
        {
            get => _employeeName;
            set => _employeeName = ValidateLength(value, MaxFieldLength150);
        }


        private string? _fathersName;
        public string? FathersName
        {
            get => _fathersName;
            set => _fathersName = ValidateLength(value, MaxFieldLength100);
        }

        private string? _gender;
        public string? Gender
        {
            get => _gender;
            set => _gender = ValidateLength(value, MaxFieldLength10);
        }

        public DateOnly? DOB { get; set; }

        private string? _email;
        public string? Email
        {
            get => _email;
            set => _email = ValidateLength(value, MaxFieldLength100);
        }

        private string? _currentAddress;
        public string? CurrentAddress
        {
            get => _currentAddress;
            set => _currentAddress = ValidateLength(value, MaxFieldLength250);
        }

        private string? _permanentAddress;
        public string? PermanentAddress
        {
            get => _permanentAddress;
            set => _permanentAddress = ValidateLength(value, MaxFieldLength250);
        }

        private string? _city;
        public string? City
        {
            get => _city;
            set => _city = ValidateLength(value, MaxFieldLength200);
        }

        private string? _State;
        public string? State
        {
            get => _State;
            set => _State = ValidateLength(value, MaxFieldLength200);
        }

        private string? _pin;
        public string? Pin
        {
            get => _pin;
            set => _pin = ValidateLength(value, MaxFieldLength20);
        }

        private string? _country;
        public string? Country
        {
            get => _country;
            set => _country = ValidateLength(value, MaxFieldLength200);
        }

        private string? _emergencyNo;
        public string? EmergencyNo
        {
            get => _emergencyNo;
            set => _emergencyNo = ValidateLength(value, MaxFieldLength20);
        }
        public DateOnly? DOJ { get; set; }
        public DateOnly? ConfirmationDate { get; set; }

        private string? _jobType;
        public string? JobType
        {
            get => _jobType;
            set => _jobType = ValidateLength(value, MaxFieldLength10);
        }

        private string? _branch;
        public string? Branch
        {
            get => _branch;
            set => _branch = ValidateLength(value, MaxFieldLength100);
        }

        private string? _pfNo;
        public string? PFNo
        {
            get => _pfNo;
            set => _pfNo = ValidateLength(value, MaxFieldLength100);
        }

        public DateOnly? PFDate { get; set; }

        private string? _bankName;
        public string? BankName
        {
            get => _bankName;
            set => _bankName = ValidateLength(value, MaxFieldLength250);
        }

        private string? _bankAccountNo;
        public string? BankAccountNo
        {
            get => _bankAccountNo;
            set => _bankAccountNo = ValidateLength(value, MaxFieldLength100);
        }

        private string? _pan;
        public string? PAN
        {
            get => _pan;
            set => _pan = ValidateLength(value, MaxFieldLength100);
        }

        private string? _eSINo;
        public string? ESINo
        {
            get => _eSINo;
            set => _eSINo = ValidateLength(value, MaxFieldLength100);
        }

        private string? _department;
        public string? Department
        {
            get => _department;
            set => _department = ValidateLength(value, MaxFieldLength100);
        }

        private string? _designation;
        public string? Designation
        {
            get => _designation;
            set => _designation = ValidateLength(value, MaxFieldLength100);
        }

        private string? _reportingManager;
        public string? ReportingManager
        {
            get => _reportingManager;
            set => _reportingManager = ValidateLength(value, MaxFieldLength250);
        }

        private string? _passportNo;
        public string? PassportNo
        {
            get => _passportNo;
            set => _passportNo = ValidateLength(value, MaxFieldLength100);
        }

        public DateOnly? PassportExpiry { get; set; }

        private string? _telephone;
        public string? Telephone
        {
            get => _telephone;
            set => _telephone = ValidateLength(value, MaxFieldLength20);
        }

        private string? _mobileNo;
        public string? MobileNo
        {
            get => _mobileNo;
            set => _mobileNo = ValidateLength(value, MaxFieldLength20);
        }

        private string? _personalEmail;
        public string? PersonalEmail
        {
            get => _personalEmail;
            set => _personalEmail = ValidateLength(value, MaxFieldLength100);
        }

        private string? _bloodGroup;
        public string? BloodGroup
        {
            get => _bloodGroup;
            set => _bloodGroup = ValidateLength(value, MaxFieldLength10);
        }

        private string? _maritalStatus;
        public string? MaritalStatus
        {
            get => _maritalStatus;
            set => _maritalStatus = ValidateLength(value, MaxFieldLength10);
        }

        private string? _uanNumber;
        public string? UANNumber
        {
            get => _uanNumber;
            set => _uanNumber = ValidateLength(value, MaxFieldLength100);
        }

        public bool HasPF { get; set; }
        public bool HasESI { get; set; }

        private string? _aadhaarNo;
        public string? AadhaarNo
        {
            get => _aadhaarNo;
            set => _aadhaarNo = ValidateLength(value, MaxFieldLength100);
        }

        public string? EmployeeStatus { get; set; } 

        private string? _createdBy;
        public string? CreatedBy
        {
            get => _createdBy;
            set => _createdBy = ValidateLength(value, MaxFieldLength250);
        }

        private string? _iFSCCode;
        public string? IFSCCode
        {
            get => _iFSCCode;
            set => _iFSCCode = ValidateLength(value, MaxFieldLength50);
        }

        private string? ValidateLength(string? value, int maxLength)
        {
            if (string.IsNullOrEmpty(value)) return value;
            return value.Length > maxLength ? value.Substring(0, maxLength) : value;
        }
    }
}
