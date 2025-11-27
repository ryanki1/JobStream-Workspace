using JobStream.Api.Models;

namespace JobStream.Api.Services;

/// <summary>
/// Service for generating and validating JWT tokens
/// </summary>
public interface IJwtService
{
    /// <summary>
    /// Generates a JWT access token for the user
    /// </summary>
    /// <param name="user">The user to generate a token for</param>
    /// <returns>JWT token string</returns>
    string GenerateAccessToken(User user);
}
