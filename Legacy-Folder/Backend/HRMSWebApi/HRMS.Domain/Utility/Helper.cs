using System.ComponentModel;
using System.Globalization;
using System.Reflection;

namespace HRMS.Domain.Utility
{
    public static class Helper
    {
        public static bool WriteIntoFileAndSave(byte[] content, string fileName, string filePath)
        {
            if (!Directory.Exists(filePath))
            {
                Directory.CreateDirectory(filePath);
            }
            using var stream = System.IO.File.Create(filePath + fileName);
            stream.Write(content, 0, content.Length);
            return true;
        }
        public static bool DeleteFile(string fileName, string filePath)
        {
            string fullPath = Path.Combine(filePath, fileName);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return true;
            }
            else
            {
                return false;
            }

        }
        public static byte[] FileToByteArray(string filePath)
        {
            byte[] fileData = null;
            using (FileStream fs = File.OpenRead(filePath))
            {
                using (BinaryReader binaryReader = new BinaryReader(fs))
                {
                    fileData = binaryReader.ReadBytes((int)fs.Length);
                }
            }
            return fileData;
        }
        public static string GetOrdinalSuffix(int number)
        {
            if (number % 100 is 11 or 12 or 13)
            {
                return "th";
            }
            switch (number % 10)
            {
                case 1:
                    return "st";
                case 2:
                    return "nd";
                case 3:
                    return "rd";
                default:
                    return "th";
            }
        }
        public static double ConvertTimeToDecimal(string timeString)
        {
            if (string.IsNullOrEmpty(timeString) || timeString.Split(":").Length < 2) return 0.0f;
            var hour = timeString.Split(":")[0];
            var min = timeString.Split(":")[1];
            var time = TimeSpan.FromHours(int.Parse(hour));
            time = time.Add(TimeSpan.FromMinutes(int.Parse(min)));
            double decimalHours = time.TotalHours;
            decimalHours = Math.Round(decimalHours, 2);
            return decimalHours;
        }

        public static List<DateTime> GetDatesBetween(DateTime startDate, DateTime endDate)
        {
            var dates = new List<DateTime>();
            var currentDate = startDate.Date;
            var finalDate = endDate.Date;

            while (currentDate <= finalDate)
            {
                dates.Add(currentDate);
                currentDate = currentDate.AddDays(1);
            }

            return dates;
        }
        public static string GetEnumDescription<TEnum>(TEnum value) where TEnum : Enum
        {
            string name = value.ToString();
            var fi = typeof(TEnum).GetField(name);

            if (fi != null)
            {
                var descriptionAttr = fi.GetCustomAttribute<DescriptionAttribute>();
                if (descriptionAttr != null)
                {
                    return descriptionAttr.Description;
                }
            }

            return name; // fallback to enum name if no description
        }
        public static int? GetEnumIdFromString<TEnum>(string input) where TEnum : struct, Enum
        {
            foreach (var value in Enum.GetValues(typeof(TEnum)).Cast<TEnum>())
            {
                string name = value.ToString();
                if (string.Equals(name, input, StringComparison.OrdinalIgnoreCase))
                {
                    return Convert.ToInt32(value);
                }

                var fi = typeof(TEnum).GetField(name);
                if (fi != null)
                {
                    var descriptionAttr = fi.GetCustomAttribute<DescriptionAttribute>();
                    if (descriptionAttr != null && string.Equals(descriptionAttr.Description, input, StringComparison.OrdinalIgnoreCase))
                    {
                        return Convert.ToInt32(value);
                    }
                }
            }
            return null;
        }

        public static string GetFormattedTime(string timeString)
        {
            if (string.IsNullOrEmpty(timeString) || timeString.Split(":").Length < 2) return "0";
            var hour = timeString.Split(":")[0];
            var min = timeString.Split(":")[1];
            try
            {
                hour = int.Parse(hour).ToString();
                min = int.Parse(min).ToString();
                return $"{hour}h {min}m";
            }
            catch (Exception) { return $"{hour}h {min}m"; }
        }

        public static string? ToTitleCase(this string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return input;

            TextInfo textInfo = CultureInfo.CurrentCulture.TextInfo;
            return textInfo.ToTitleCase(input.ToLower());
        }
   
    }
}
