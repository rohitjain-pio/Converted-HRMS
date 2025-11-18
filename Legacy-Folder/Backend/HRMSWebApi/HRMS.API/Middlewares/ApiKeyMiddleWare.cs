using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using HRMS.Models.Models.Auth;
using System.Net.Sockets;
using System.Security.Claims;
using System.Text.Json;

namespace HRMS.API.Middlewares
{
    public class ApiKeyMiddleWare
    {
        private readonly RequestDelegate _next;
        private const string ApiKeyHeaderName = "X-API_KEY";
        private readonly string _authorizedKey = string.Empty;
        private readonly string _buildVersion = string.Empty;
        private readonly string _TokenForDwnTwn = string.Empty;
        private readonly IMemoryCache _cache;
        private readonly RateLimitingOptions _rateLimitingOptions;


        public ApiKeyMiddleWare(RequestDelegate next, IConfiguration configuration, IMemoryCache cache, IOptions<RateLimitingOptions> rateLimitingOptions)
        {
            _next = next;
            _cache = cache;
            _rateLimitingOptions = rateLimitingOptions.Value;
            _authorizedKey = configuration["ApiKeys:AuthorizedKey"];
            _buildVersion = configuration["BuildVersions:Version"];
            _TokenForDwnTwn = configuration["TokenForDwnTwn:TokenDT"];
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var ipAddress = context.Connection.RemoteIpAddress?.ToString();
            if (!string.IsNullOrEmpty(ipAddress))
            {
                var cacheKey = $"RateLimit_{ipAddress}";
                var requestCount = _cache.GetOrCreate<int>(cacheKey, entry =>
                {
                    entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_rateLimitingOptions.PeriodInMinutes);
                    return 0;
                });


                if (requestCount >= _rateLimitingOptions.Limit)
                {
                    context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                    await context.Response.WriteAsync("Rate limit exceeded.");
                    return;
                }
                requestCount++;
                _cache.Set(cacheKey, requestCount
                , new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(_rateLimitingOptions.PeriodInMinutes)
                }
                );
            }
            if (context.Request.Headers.TryGetValue("Build-Version", out var buildVersion))
            {
               
                if (buildVersion.Any())
                {
                    var buildVersions = buildVersion.FirstOrDefault();
                    if (!_buildVersion.ToString().Equals(buildVersions))
                    {
                        object versionObject = new
                        {
                            buildVersion = _buildVersion,
                            message = "Build version is missmatched" 
                        };
                        context.Response.StatusCode = StatusCodes.Status422UnprocessableEntity;
                        var json = JsonSerializer.Serialize(versionObject);
                        await context.Response.WriteAsync(json); 
                        return;
                    }
                }
            }
            //Check if the request has an Authorization header
            if (context.Request.Headers.TryGetValue("Authorization", out var authHeader))
            {
                if (authHeader.ToString().StartsWith("Bearer", StringComparison.OrdinalIgnoreCase))
                {
                    //Skip API Key validation for request with a Bearer token
                    await _next(context);
                    return;
                }
                
            }

            //Check if the request has an Authorization header
            if (context.Request.Headers.TryGetValue("HRMS-Token", out var authHeaderForDwnTwn))
            {
                //Check for the X-API-KEY header for API application requests

                if (authHeaderForDwnTwn.ToString().Equals(_TokenForDwnTwn, StringComparison.Ordinal))
                {
                    //Create a new claim for API key authntication
                    var customClaim = new Claim("IsApiKeyAuthenticated", "true");

                    //Get exiting identities and claims
                    var exisitingUser = context.User ?? new ClaimsPrincipal();
                    // Add the Claim using a new Identity
                    var newIdentity = new ClaimsIdentity(new[] { customClaim }, "ApiKey");
                    var cominedPrincipal = new ClaimsPrincipal(exisitingUser.Identities.Append(newIdentity));

                    //Assign the updated principal to HttpContext.User
                    context.User = cominedPrincipal;
                    await _next(context);
                    return;

                }
                else
                {
                    //Invalid API Key
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsync("Forbidden: Invalid API Key.");
                    return;
                }
                 
            }

            if (context.Request.Path.Equals("/api/Auth/CheckHealth"))
            {
                await _next(context);
                return;
            }
            
            // used for internal login endpoint access - in case if string "Bearer" (even without token) in the Auth header is not set
            //Check for the X-API-KEY header for API application requests 
            if (context.Request.Headers.TryGetValue(ApiKeyHeaderName, out var apikey) && context.Request.Path.Equals("/api/Auth/Login"))
            {
                if (apikey.ToString().Equals(_authorizedKey, StringComparison.Ordinal))
                {
                    //Create a new claim for API key authntication
                    var customClaim = new Claim("IsApiKeyAuthenticated", "true");

                    //Get exiting identities and claims
                    var exisitingUser = context.User ?? new ClaimsPrincipal();
                    // Add the Claim using a new Identity
                    var newIdentity = new ClaimsIdentity(new[] { customClaim }, "ApiKey");
                    var cominedPrincipal = new ClaimsPrincipal(exisitingUser.Identities.Append(newIdentity));

                    //Assign the updated principal to HttpContext.User
                    context.User = cominedPrincipal;
                    await _next(context);
                    return;

                }
                else
                {
                    //Invalid API Key
                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsync("Forbidden: Invalid API Key.");
                    return;
                }
            }
            else
            {
                //Missing API key
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsync("Forbidden: Missing API Key.");
                return;

            }


        }
       

    }
   
}
