using HRMS.Domain.Contants;
using HRMS.Domain.Enums;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models
{
    public class ApiResponseModel<T>
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public T? Result { get; set; }
        public ApiResponseModel(int StatusCode, string Message, T? Result)
        {
            this.StatusCode = StatusCode;
            this.Message = Message;
            this.Result = Result;
        }
    }

}
