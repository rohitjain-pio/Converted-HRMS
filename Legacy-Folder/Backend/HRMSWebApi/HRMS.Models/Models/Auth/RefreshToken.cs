namespace HRMS.Models.Models.Auth
{
    public class RefreshToken
    {
        public int UserId { get; set; }
        public string TokenValue { get; set; } = default!;
        public DateTime Expires { get; set; }

    }
}
