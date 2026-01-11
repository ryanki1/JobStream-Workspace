namespace JobStream.Api.Models;

public class UserGoogleInfo
{
    public string? Id { get; set; }
    public string? Email { get; set; }
    public string? Name { get; set; }
    public string? Picture { get; set; }
    public bool IsAuthenticated { get; set; }
}