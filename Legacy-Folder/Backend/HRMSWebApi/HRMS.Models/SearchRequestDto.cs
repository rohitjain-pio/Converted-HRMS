using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HRMS.Models
{
    public class SearchRequestDto<T> where T : class
    {
        public string SortColumnName { get; set; } = string.Empty;
        public string SortDirection { get; set; } = string.Empty;
        public int StartIndex { get; set; }
        public int PageSize { get; set; }
        public T Filters { get; set; } = default!;

    }

}
