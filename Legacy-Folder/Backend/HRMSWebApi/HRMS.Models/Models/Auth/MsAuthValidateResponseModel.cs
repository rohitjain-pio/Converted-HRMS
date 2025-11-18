using Newtonsoft.Json;

namespace HRMS.Models.Models.Auth
{
        public class MsAuthValidateResponseModel
    {
        [JsonProperty("@odata.context")]
        public string? odatacontext { get; set; }
        public List<object>? businessPhones { get; set; }
        public string? displayName { get; set; }
        public string? givenName { get; set; }
        public string? jobTitle { get; set; }
        public string? mail { get; set; }
        public string? mobilePhone { get; set; }
        public object? officeLocation { get; set; }
        public object? preferredLanguage { get; set; }
        public string? surname { get; set; }
        public string? userPrincipalName { get; set; }
        public string? id { get; set; }
    }


}
