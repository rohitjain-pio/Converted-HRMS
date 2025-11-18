namespace HRMS.Domain.Configurations
{
    public class AppConfigOptions
    {
        public string BlobStorageUrl { get; set; } = null!;
        public int UserProfileMaxSize { get; set; }
        public int PolicyDocumentMaxSize { get; set; }
        public int PolicyVersionUpdateTime { get; set; }

        public int UserDocFileMaxSize { get; set; }
        public int ExcelImportMaxSize { get; set; }
    }
}
