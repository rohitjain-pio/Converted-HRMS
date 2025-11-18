using HRMS.API.Extensions;
using HRMS.Domain;
using HRMS.Domain.Exceptions;
using HRMS.Models.Models.Auth;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration.Get<AppSettings>()
    ?? throw ProgramException.AppsettingNotSetException();
builder.Services.AddSingleton(configuration); 
builder.Services.Configure<RateLimitingOptions>(
    builder.Configuration.GetSection("RateLimiting"));

builder.Services.AddMemoryCache();
var app = await builder.ConfigureServices(configuration).ConfigurePipelineAsync(configuration);

await app.RunAsync();
