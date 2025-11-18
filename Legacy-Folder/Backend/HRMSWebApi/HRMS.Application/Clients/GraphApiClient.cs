using HRMS.Domain.Enums;
using HRMS.Domain.Utility;
using HRMS.Models.Models.Auth;

namespace HRMS.Application.Clients
{
    public class GraphApiClient : BaseHttpClient
    {
        public GraphApiClient(HttpClient httpClient) : base(httpClient)
        {

        }

        public async Task<MsAuthValidateResponseModel> ValidateMicroSoftOAuthToken(string token)
        {
            return await Get<MsAuthValidateResponseModel>(ClientType.GraphApiClient,null ,token);
        }
    }
}
