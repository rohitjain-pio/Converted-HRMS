using HRMS.Domain.Enums;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace HRMS.Domain.Utility
{
    public class BaseHttpClient
    {
        private readonly HttpClient _httpClient;

        public BaseHttpClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        protected async Task<T> Get<T>(ClientType clientType, string? uri = null, string? token = null)
        {
            var request = CreateRequest(HttpMethod.Get, uri);

            return await ExecuteRequest<T>(request, clientType, token);
        }

        protected async Task<T> Post<T>(object content, ClientType clientType, string? uri = null, string? token = null)
        {
            var request = CreateRequest(HttpMethod.Post, uri, content);

            return await ExecuteRequest<T>(request, clientType, token);
        }

        private static HttpRequestMessage CreateRequest(HttpMethod httpMethod, string? uri, object? content = null)
        {
            var request = new HttpRequestMessage(httpMethod, uri);
            if (content == null) return request;

            // Serialize content
            var json = JsonSerializer.Serialize(content);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");

            return request;
        }

        private async Task<T> ExecuteRequest<T>(HttpRequestMessage request, ClientType clientType, string? token = null)
        {
            try
            {               
                if (clientType == ClientType.GraphApiClient || clientType == ClientType.EmailNotificationClient)
                    _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
                var response = await _httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead)
                    .ConfigureAwait(false);
                var responseContent = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
                List<HttpStatusCode> listStatusCodes =
                [
                    HttpStatusCode.OK,
                    HttpStatusCode.Created,
                    HttpStatusCode.Accepted
                ];


                if (listStatusCodes.Contains(response.StatusCode))
                {
                    response.EnsureSuccessStatusCode();

                    return string.IsNullOrEmpty(responseContent) ? default : JsonSerializer.Deserialize<T>(responseContent);
                }
                else
                {
                    if (clientType == ClientType.EmailNotificationClient)
                    {
                        var errorResponse = Activator.CreateInstance<T>();
                        try
                        {
                            throw new Exception(responseContent);
                        }
                        catch (Exception) { }
                        return errorResponse;
                    }
                    throw new Exception(responseContent);
                }
            }
            catch (Exception ex) when (ex is ArgumentNullException ||
                                       ex is InvalidOperationException ||
                                       ex is HttpRequestException ||
                                       ex is JsonException)
            {
                throw new Exception("HttpClient exception", ex);
            }
        }
    }
}
