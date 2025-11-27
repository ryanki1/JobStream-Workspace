using JobStream.Api.Models;

namespace JobStream.Api.Services;

/// <summary>
/// Service for handling password reset functionality
/// </summary>
public interface IPasswordResetService
{
    /// <summary>
    /// Creates a password reset token for a user and sends reset email
    /// </summary>
    Task<string> CreatePasswordResetTokenAsync(User user, string ipAddress);

    /// <summary>
    /// Validates a password reset token
    /// </summary>
    Task<PasswordResetToken?> ValidateTokenAsync(string token);

    /// <summary>
    /// Marks a token as used after successful password reset
    /// </summary>
    Task MarkTokenAsUsedAsync(PasswordResetToken resetToken);

    /// <summary>
    /// Cleans up expired tokens (for background job)
    /// </summary>
    Task CleanupExpiredTokensAsync();
}
