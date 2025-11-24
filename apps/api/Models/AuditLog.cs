using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace JobStream.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AuditAction
{
    RegistrationStarted,
    EmailVerified,
    DetailsSubmitted,
    DocumentsUploaded,
    FinancialSubmitted,
    MLVerificationRequested,
    MLVerificationCompleted,
    AdminReviewStarted,
    RegistrationApproved,
    RegistrationRejected,
    StakeDeposited,
    StatusChanged,
    NotesAdded,
    DocumentDeleted,
    RegistrationUpdated
}

public class AuditLog
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CompanyRegistrationId { get; set; }

    [Required]
    public AuditAction Action { get; set; }

    [Required]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// The user who performed the action (admin email, system, or "Company")
    /// </summary>
    [Required]
    [MaxLength(255)]
    public string PerformedBy { get; set; } = string.Empty;

    /// <summary>
    /// Additional details about the action in JSON format
    /// </summary>
    [Column(TypeName = "TEXT")]
    public string? DetailsJson { get; set; }

    /// <summary>
    /// The status before the action (if applicable)
    /// </summary>
    [MaxLength(50)]
    public string? PreviousStatus { get; set; }

    /// <summary>
    /// The status after the action (if applicable)
    /// </summary>
    [MaxLength(50)]
    public string? NewStatus { get; set; }

    /// <summary>
    /// IP address of the user who performed the action
    /// </summary>
    [MaxLength(50)]
    public string? IpAddress { get; set; }

    /// <summary>
    /// User agent of the client
    /// </summary>
    [MaxLength(500)]
    public string? UserAgent { get; set; }

    // Navigation property
    [ForeignKey(nameof(CompanyRegistrationId))]
    public CompanyRegistration? CompanyRegistration { get; set; }
}
