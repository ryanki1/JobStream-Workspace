using System.Text.Json;
using JobStream.Api.Data;
using JobStream.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobStream.Api.Services;

/// <summary>
/// Service for managing audit logs and tracking registration actions
/// </summary>
public class AuditLogService : IAuditLogService
{
    private readonly JobStreamDbContext _context;
    private readonly ILogger<AuditLogService> _logger;

    public AuditLogService(JobStreamDbContext context, ILogger<AuditLogService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task LogActionAsync(
        Guid registrationId,
        AuditAction action,
        string performedBy,
        object? details = null,
        string? ipAddress = null,
        string? userAgent = null)
    {
        try
        {
            var auditLog = new AuditLog
            {
                CompanyRegistrationId = registrationId,
                Action = action,
                PerformedBy = performedBy,
                Timestamp = DateTime.UtcNow,
                IpAddress = ipAddress,
                UserAgent = userAgent
            };

            // Serialize details to JSON if provided
            if (details != null)
            {
                auditLog.DetailsJson = JsonSerializer.Serialize(details, new JsonSerializerOptions
                {
                    WriteIndented = false,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });
            }

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Audit log created: {Action} for registration {RegistrationId} by {PerformedBy}",
                action,
                registrationId,
                performedBy
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to create audit log for registration {RegistrationId}, action {Action}",
                registrationId,
                action
            );
            // Don't throw - audit logging should not break the main flow
        }
    }

    /// <inheritdoc />
    public async Task LogStatusChangeAsync(
        Guid registrationId,
        string previousStatus,
        string newStatus,
        string performedBy,
        string? ipAddress = null,
        string? userAgent = null)
    {
        try
        {
            var auditLog = new AuditLog
            {
                CompanyRegistrationId = registrationId,
                Action = AuditAction.StatusChanged,
                PerformedBy = performedBy,
                Timestamp = DateTime.UtcNow,
                PreviousStatus = previousStatus,
                NewStatus = newStatus,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                DetailsJson = JsonSerializer.Serialize(new
                {
                    from = previousStatus,
                    to = newStatus
                })
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Status change logged: {PreviousStatus} -> {NewStatus} for registration {RegistrationId} by {PerformedBy}",
                previousStatus,
                newStatus,
                registrationId,
                performedBy
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to log status change for registration {RegistrationId}",
                registrationId
            );
            // Don't throw - audit logging should not break the main flow
        }
    }

    /// <inheritdoc />
    public async Task<List<AuditLog>> GetRegistrationHistoryAsync(Guid registrationId)
    {
        return await _context.AuditLogs
            .Where(a => a.CompanyRegistrationId == registrationId)
            .OrderByDescending(a => a.Timestamp)
            .ToListAsync();
    }

    /// <inheritdoc />
    public async Task<List<AuditLog>> GetRecentLogsAsync(int limit = 50)
    {
        return await _context.AuditLogs
            .Include(a => a.CompanyRegistration)
            .OrderByDescending(a => a.Timestamp)
            .Take(limit)
            .ToListAsync();
    }
}
