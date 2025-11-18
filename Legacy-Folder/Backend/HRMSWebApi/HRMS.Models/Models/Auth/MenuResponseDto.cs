namespace HRMS.Models.Models.Auth
{
    public class MenuResponseDto
    {
        public string MainMenu { get; set; } = default!;
        public string MainMenuApiEndPoint { get; set; } = default!;
        public List<SubMenuModel> SubMenus { get; set; } = new();
    }
}
