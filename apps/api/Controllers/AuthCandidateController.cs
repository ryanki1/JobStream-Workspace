
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobStream.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = CookieAuthenticationDefaults.AuthenticationScheme + "," + GoogleDefaults.AuthenticationScheme)]
public class AuthCandidateController : ControllerBase
{
    /// <summary>
    /// Initiiert den Google OAuth Flow.
    /// Frontend redirectet User hierhin: window.location.href = '/api/authcompany/login'
    ///
    /// Flow:
    /// 1. User klickt Login
    /// 2. Dieser Endpunkt startet Challenge() -> Redirect zu Google
    /// 3. Google OAuth Consent Screen
    /// 4. Nach Consent: Google redirectet zu /signin-google (automatischer .NET Handler)
    /// 5. .NET verarbeitet Token, setzt Cookie
    /// 6. Redirect zur RedirectUri (Frontend)
    /// </summary>
    [HttpGet("login")]
    public IActionResult Login()
    {
        var properties = new AuthenticationProperties
        {
            // Nach erfolgreichem Login: Redirect zurück zum Frontend
            RedirectUri = "http://localhost:4200/auth/success"
        };

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    /// <summary>
    /// Logout: Löscht Authentication Cookie.
    /// </summary>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync();
        return Ok(new { message = "Logged out successfully" });
    }
}
