using JobStream.Api.Models;

namespace JobStream.Api.Services;

/// <summary>
/// Service for managing audit logs and tracking registration actions
/// </summary>
public interface IAuditLogService
{
    /// <summary>
    /// Log an action for a company registration
    /// </summary>
    /// <param name="registrationId">The registration ID</param>
    /// <param name="action">The action performed</param>
    /// <param name="performedBy">Who performed the action (admin email, "System", or "Company")</param>
    /// <param name="details">Optional additional details (will be serialized to JSON)</param>
    /// <param name="ipAddress">Optional IP address of the user</param>
    /// <param name="userAgent">Optional user agent</param>
    Task LogActionAsync(
        Guid registrationId,
        AuditAction action,
        string performedBy,
        object? details = null,
        string? ipAddress = null,
        string? userAgent = null);

    /// <summary>
    /// Log a status change for a company registration
    /// </summary>
    /// <param name="registrationId">The registration ID</param>
    /// <param name="previousStatus">The previous status</param>
    /// <param name="newStatus">The new status</param>
    /// <param name="performedBy">Who performed the action</param>
    /// <param name="ipAddress">Optional IP address</param>
    /// <param name="userAgent">Optional user agent</param>
    Task LogStatusChangeAsync(
        Guid registrationId,
        string previousStatus,
        string newStatus,
        string performedBy,
        string? ipAddress = null,
        string? userAgent = null);

    /// <summary>
    /// Get the complete audit history for a registration
    /// </summary>
    /// <param name="registrationId">The registration ID</param>
    /// <returns>List of audit logs ordered by timestamp descending</returns>
    Task<List<AuditLog>> GetRegistrationHistoryAsync(Guid registrationId);

    /// <summary>
    /// Get recent audit logs across all registrations
    /// </summary>
    /// <param name="limit">Maximum number of logs to return</param>
    /// <returns>List of recent audit logs</returns>
    Task<List<AuditLog>> GetRecentLogsAsync(int limit = 50);
}
