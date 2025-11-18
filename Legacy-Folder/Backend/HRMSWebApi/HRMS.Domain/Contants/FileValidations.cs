namespace HRMS.Domain.Contants
{
    public static class FileValidations
    {
        public const string AllowCharsInFileName = @"^[a-zA-Z0-9_\-\.\(\) ]+$";
        public const int FileNameLength = 100;
        public const long FileSize  = 5242880;
        public static readonly string[] AllowImageTypes = [".jpg", ".jpeg", ".png"];
        public static readonly string[] AllowOnlyPdf = { ".pdf" };
        public static readonly string[] AllowedExtensions= { ".xls", ".xlsx" };
        public static readonly string[] AllowImageAndPdfTypes = [".jpg",".jpeg",".png",".pdf"];
    }
}
