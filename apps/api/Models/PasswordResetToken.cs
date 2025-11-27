using System.ComponentModel.DataAnnotations;

namespace JobStream.Api.Models;

/// <summary>
/// Represents a password reset token for secure password recovery
/// </summary>
public class PasswordResetToken
{
    /// <summary>
    /// Unique identifier for the reset token
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// User ID this token belongs to
    /// </summary>
    [Required]
    public Guid UserId { get; set; }

    /// <summary>
    /// Navigation property to the user
    /// </summary>
    public User User { get; set; } = null!;

    /// <summary>
    /// Cryptographically secure random token
    /// </summary>
    [Required]
    [MaxLength(256)]
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Timestamp when the token was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the token expires (typically 1 hour)
    /// </summary>
    [Required]
    public DateTime ExpiresAt { get; set; }

    /// <summary>
    /// Indicates if the token has been used
    /// </summary>
    [Required]
    public bool Used { get; set; } = false;

    /// <summary>
    /// Timestamp when the token was used (if applicable)
    /// </summary>
    public DateTime? UsedAt { get; set; }

    /// <summary>
    /// IP address of the requester (for audit trail)
    /// </summary>
    [MaxLength(45)]
    public string? RequestIpAddress { get; set; }
}
