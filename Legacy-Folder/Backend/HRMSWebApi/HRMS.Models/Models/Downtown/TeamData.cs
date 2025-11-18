namespace HRMS.Models.Models.Downtown
{
    public class TeamData
    {
        public List<Team> teams { get; set; } = new List<Team>();
    }
    public class Team
    {
        public int id { get; set; }
        public string title { get; set; }
        public string description { get; set; }
    }
}
