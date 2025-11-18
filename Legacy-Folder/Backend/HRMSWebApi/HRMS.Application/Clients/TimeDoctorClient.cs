using HRMS.Models.Models.TimeDoctorClient;
using System.Text.Json;
using System.Web;

namespace HRMS.Application.Clients
{
    public class TimeDoctorClient
    {
        private readonly HttpClient client;
        private const string companyId = "YfQJah6-uiOk6nqu";
        public TimeDoctorClient(HttpClient _client)
        {
            client = _client;
        }

        public async Task<bool> IsTimeDoctorUserIdValid(string email, string timeDoctorUserId)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(timeDoctorUserId)) return false;
            try
            {
                var builder = new UriBuilder(client.BaseAddress.OriginalString);
                builder.Path = $"{builder.Path.TrimEnd('/')}/{timeDoctorUserId}";
                var query = HttpUtility.ParseQueryString(builder.Query);
                query["company"] = companyId;
                query["detail"] = "name";
                builder.Query = query.ToString();
                string finalUrl = builder.ToString();

                var response = await client.GetAsync(finalUrl);
                response.EnsureSuccessStatusCode();
                var responseBody = await response.Content.ReadAsStringAsync();
                var info = JsonSerializer.Deserialize<TimeDoctorUserByIdResponsDto>(responseBody, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
                return info?.Data?.Email?.ToLower().Equals(email.ToLower()) ?? false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<string?> GetTimeDoctorUserIdByEmail(string email)
        {
            if (string.IsNullOrEmpty(email)) return null;
            var builder = new UriBuilder(client.BaseAddress.OriginalString);
            builder.Path = $"{builder.Path.TrimEnd('/')}/";
            var query = HttpUtility.ParseQueryString(builder.Query);
            query["company"] = companyId;
            query["detail"] = "name";
            query["include-archived-users"] = "false";
            query["filter[email]"] = email;
            builder.Query = query.ToString();
            string finalUrl = builder.ToString();

            var response = await client.GetAsync(finalUrl);
            response.EnsureSuccessStatusCode();
            var responseBody = await response.Content.ReadAsStringAsync();
            var info = JsonSerializer.Deserialize<TimeDoctorUserByEmailResponseDto>(responseBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
            if (info == null || info.Data == null || info.Data.Count < 1) return null;
            var first = info.Data[0];
            if (first.Email == null) return null;
            return first.Email.ToLower().Equals(email.ToLower()) ? first.Id : null;
        }
    }
}
