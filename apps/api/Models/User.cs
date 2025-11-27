using System.ComponentModel.DataAnnotations;

namespace JobStream.Api.Models;

/// <summary>
/// Represents a user account in the JobStream system
/// </summary>
public class User
{
    /// <summary>
    /// Unique identifier for the user
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// User's email address (unique, used for login)
    /// </summary>
    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// BCrypt hashed password
    /// </summary>
    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// User's role in the system
    /// </summary>
    [Required]
    public UserRole Role { get; set; }

    /// <summary>
    /// Optional link to company registration (for Company role users)
    /// </summary>
    public Guid? CompanyRegistrationId { get; set; }

    /// <summary>
    /// Navigation property to linked company registration
    /// </summary>
    public CompanyRegistration? CompanyRegistration { get; set; }

    /// <summary>
    /// Timestamp when the user account was created
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp of the user's last login
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// Indicates if the user account is active
    /// </summary>
    [Required]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Indicates if the user's email has been verified
    /// </summary>
    [Required]
    public bool EmailVerified { get; set; } = false;
}
