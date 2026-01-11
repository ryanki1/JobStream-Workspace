using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using JobStream.Api.Models;


namespace JobStream.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserCandidateController : ControllerBase
{
    /// <summary>
    /// Gibt Informationen über den aktuell eingeloggten User zurück.
    /// Wird vom Frontend aufgerufen, um Login-Status zu prüfen.
    /// Cookie wird automatisch mitgesendet (withCredentials: true).
    /// </summary>
    [HttpGet("me")]
    public IActionResult GetCurrentUser()
    {
        // Prüfen ob User authentifiziert ist
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Ok(new UserGoogleInfo { IsAuthenticated = false });
        }

        // Claims aus Cookie auslesen
        var userInfo = new JobStream.Api.Models.UserGoogleInfo
        {
            IsAuthenticated = true,
            Id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            Email = User.FindFirst(ClaimTypes.Email)?.Value,
            Name = User.FindFirst(ClaimTypes.Name)?.Value,
            Picture = User.FindFirst("picture")?.Value
        };

        return Ok(userInfo);
    }

    /// <summary>
    /// Geschützter Endpunkt - nur für authentifizierte User.
    /// </summary>
    [Authorize]
    [HttpGet("profile")]
    public IActionResult GetProfile()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value });
        return Ok(new
        {
            message = "This is a protected endpoint",
            claims
        });
    }
}