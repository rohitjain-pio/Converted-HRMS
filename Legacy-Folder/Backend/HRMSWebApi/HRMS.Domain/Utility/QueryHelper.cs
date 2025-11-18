namespace HRMS.Domain.Utility
{
    using Dapper;
    using System.Text;

    public class QueryHelper
    {
        private readonly string _selectBuilder;
        private readonly StringBuilder _fromBuilder;
        private readonly StringBuilder _whereBuilder = new();
        private readonly StringBuilder _orderBuilder = new();
        private readonly StringBuilder _paginationBuilder = new();

        private readonly DynamicParameters _params = new();
        private readonly List<string> _sortableColumns = new();

        private bool _hasWhereStarted = false;
        private bool _lastWasLogical = false;

        private int _paraNum = 0;

        private string getNextParaSuffixFromColumnName(string column)
        {
            column = column.Replace("[", "");
            column = column.Replace("]", "");
            var cName = column.Split(".").Length > 1 ? column.Split(".")[1] : column; // ED.EmployeeName -> EmployeeName
            return string.Concat(cName, ++_paraNum);
        }

        public QueryHelper(string baseQuery)
        {
            _selectBuilder = baseQuery.Trim();
        }
        public QueryHelper FromTables(string tbls)
        {
            _fromBuilder.Append($" FROM {tbls}");
            return this;
        }
        public QueryHelper Where(Action<QueryHelper> whereBuilder)
        {
            if (!_hasWhereStarted)
            {
                _whereBuilder.Append(" WHERE 1=1 ");
                _hasWhereStarted = true;
            }

            _lastWasLogical = false;
            whereBuilder(this);
            return this;
        }

        public QueryHelper And(string condition)
        {
            if (_lastWasLogical)
                _whereBuilder.Append(condition);
            else
                _whereBuilder.Append(" AND ").Append(condition);

            _lastWasLogical = false;
            return this;
        }
        public QueryHelper AndNullOrLike(string column, string? value = null)
        {
            if (string.IsNullOrWhiteSpace(value)) return this;
            var para = getNextParaSuffixFromColumnName(column);

            if (!_lastWasLogical)
                _whereBuilder.Append(" AND ");
            _whereBuilder.Append($" {column} LIKE '%'+@{para}+'%'");

            _lastWasLogical = false;
            _params.Add(para, value);
            return this;
        }
        public QueryHelper AndNullOrEqual(string column, bool? value = null)
        {
            if (value == null) return this;
            var para = getNextParaSuffixFromColumnName(column);

            if (!_lastWasLogical)
                _whereBuilder.Append(" AND ");
            _whereBuilder.Append($" {column} = @{para}");

            _lastWasLogical = false;
            _params.Add(para, value);
            return this;
        }
        public QueryHelper AndNullOrEqual(string column, string? value = null)
        {
            if (string.IsNullOrWhiteSpace(value)) return this;
            var para = getNextParaSuffixFromColumnName(column);

            if (!_lastWasLogical)
                _whereBuilder.Append(" AND ");
            _whereBuilder.Append($" {column} = @{para}");

            _lastWasLogical = false;
            _params.Add(para, value);
            return this;
        }
        public DynamicParameters GetParams()
        {
            return _params;
        }

        public QueryHelper Or(string condition)
        {
            _whereBuilder.Append(" OR ").Append(condition);
            _lastWasLogical = false;
            return this;
        }
        public QueryHelper AndGroup(Action<QueryHelper> groupBuilder)
        {
            _whereBuilder.Append(" AND (");
            _lastWasLogical = true;
            groupBuilder(this);
            _whereBuilder.Append(')');
            _lastWasLogical = false;
            return this;
        }

        public QueryHelper OrGroup(Action<QueryHelper> groupBuilder)
        {
            _whereBuilder.Append(" OR (");
            _lastWasLogical = true;
            groupBuilder(this);
            _whereBuilder.Append(')');
            _lastWasLogical = false;
            return this;
        }

        public QueryHelper AllowSortingFor(params string[] columns)
        {
            _sortableColumns.AddRange(columns);
            return this;
        }
        public QueryHelper AllowSortingForTypeFields<T>()
        {
            Type type = typeof(T);
            var fields = type.GetProperties().Select(f => f.Name.ToLower());
            _sortableColumns.AddRange(fields);
            return this;
        }

        public QueryHelper OrderByColumnOrOne(string clause, string order = "ASC")
        {
            if (!_sortableColumns.Contains(clause.ToLower()) && !string.IsNullOrWhiteSpace(clause))
                throw new Exception($"ORDER BY on column \"{clause}\" not allowed");

            clause = string.IsNullOrWhiteSpace(clause) ? "1" : clause;
            order = string.Equals(order.ToLower(), "desc") ? "DESC" : "ASC";
            _orderBuilder.Append($" ORDER BY {clause} {order}");
            return this;
        }
        public QueryHelper PagingOrNull(int? offset = null, int? rows = null)
        {
            if (offset == null || rows == null || rows < 1) return this;
            _paginationBuilder.Append($" OFFSET @PageOffset ROWS FETCH NEXT @PageSize ROWS ONLY");
            _params.Add("PageOffset", offset);
            _params.Add("PageSize", rows);
            return this;
        }

        public override string ToString()
        {
            return _selectBuilder.ToString()
                 + _fromBuilder.ToString()
                 + _whereBuilder.ToString()
                 + _orderBuilder.ToString()
                 + _paginationBuilder.ToString();
        }
        public string ToCountString(string tableName)
        {
            return "SELECT COUNT(1) FROM "
                 + _fromBuilder.ToString()
                 + _whereBuilder.ToString();
        }
    }
    /* usage 
        var query = new QueryHelper(@"SELECT EmployeeId, TimeDoctorUserId,
							    EmployeeCode,
                                EmployeeFullName AS EmployeeName,
                                OfficeEmail AS EmployeeEmail,
                                Designation,
                                Department,
                                Country, 
                                IsManualAttendance")
                            .FromTables(@"vw_EmployeeData ED JOIN EmployeeData ED")
                            .Where(q => q
                                .AndNullOrLike("ED.[EmployeeFullname]", requestDto.Filters.EmployeeName)
                                .AndNullOrLike("Country", requestDto.Filters.Country)
                                .AndNullOrLike("Department", requestDto.Filters.Department)
                                .AndNullOrLike("Branch", requestDto.Filters.Branch)
                                .AndNullOrLike("Designation", requestDto.Filters.Designation)
                                .AndNullOrLike("OfficeEmail", requestDto.Filters.EmployeeEmail)
                                .AndNullOrEqual("EmployeeCode", requestDto.Filters.EmployeeCode)
                                .AndNullOrEqual("IsManualAttendance", requestDto.Filters.IsManualAttendance)
                            )
                            .AllowSortingForTypeFields<AttendancConfigDto>()
                            .OrderByColumnOrOne(requestDto.SortColumnName, requestDto.SortDirection)
                            .PagingOrNull(requestDto.StartIndex, requestDto.PageSize);
            using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
            connection.Open();
            var totalRecords = await connection.QuerySingleOrDefaultAsync<int>(query.ToCountString("vw_EmployeeData ED"), query.GetParams());
            var attendanceConfigList = (await connection.QueryAsync<AttendancConfigDto>(query.ToString(), query.GetParams())).ToList();

     */

    /* usage
    var query = new QueryHelper("SELECT * FROM Users")
    .Where(q => q
        .AndGroup(g => g
            .And("VAR = 1")
            .AndGroup(inner => inner
                .Or("VAR2 = 3")
                .Or("VAR2 = 4")
            )
        )
        .OrGroup(g => g
            .And("VAR3 = 5")
            .And("VAR4 = 5")
        )
        .And("DEL = 0")
    )
    .OrderBy("Name ASC")
    .Offset(10)
    .FetchNext(10)
    .ToString();

     */
}
