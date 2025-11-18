using HRMS.Application.Clients;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using HRMS.DownTownDataSync.Repositories.Interfaces;
using HRMS.DownTownDataSync.Repositories;
using HRMS.DownTownDataSync.Services.Interface;
using HRMS.DownTownDataSync.Services;
using HRMS.Application.Mappings;
using HRMS.DownTownDataSync.Mappings;
using OfficeOpenXml;

var builder = Host.CreateApplicationBuilder(args);

builder.Configuration.SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

var downTownUrl = builder.Configuration["HttpClientsUrl:DownTownApiUrl"];
var downTownApiToken = builder.Configuration["HttpClientsUrl:DownTownApiToken"];


builder.Services.AddHttpClient<DownTownClient>(config =>
{
    config.BaseAddress = new Uri(downTownUrl);
    config.DefaultRequestHeaders.Add("apitoken", downTownApiToken);
    config.Timeout = TimeSpan.FromSeconds(60);
});
builder.Services.AddAutoMapper(typeof(MappingProfile));
builder.Services.AddScoped<IDowntownDataSyncService, DowntownDataSyncService>();
builder.Services.AddScoped<IDowntownDataSyncRepository, DowntownDataSyncRepository>();
//Register services
var app = builder.Build();
var downtowonSyncService = app.Services.GetService<IDowntownDataSyncService>();
ExcelPackage.LicenseContext = LicenseContext.NonCommercial;


using (var scope = app.Services.CreateScope())
{    
    Console.WriteLine("Starting data synchronization..");   
    await downtowonSyncService.SyncDownTownDataAsync();
    await downtowonSyncService.ProcessAndSaveDataAync();
    Console.WriteLine("Data synchronization completed..");
}


