using System.Security.Cryptography;
using JobStream.Api.Data;
using JobStream.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobStream.Api.Services;

/// <summary>
/// Implementation of password reset functionality
/// </summary>
public class PasswordResetService : IPasswordResetService
{
    private readonly JobStreamDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PasswordResetService> _logger;

    public PasswordResetService(
        JobStreamDbContext context,
        IEmailService emailService,
        IConfiguration configuration,
        ILogger<PasswordResetService> logger)
    {
        _context = context;
        _emailService = emailService;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Creates a secure password reset token and sends email
    /// </summary>
    public async Task<string> CreatePasswordResetTokenAsync(User user, string ipAddress)
    {
        // Generate cryptographically secure random token
        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var token = Convert.ToBase64String(tokenBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");

        // Create token record
        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = token,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddHours(1), // 1 hour expiration
            RequestIpAddress = ipAddress
        };

        _context.PasswordResetTokens.Add(resetToken);
        await _context.SaveChangesAsync();

        // Send password reset email
        var resetUrl = $"{_configuration["Email:VerificationUrlBase"]?.Replace("/register/verify", "/auth/reset-password")}?token={token}";

        await _emailService.SendEmailAsync(
            user.Email,
            "Password Reset Request - JobStream",
            GeneratePasswordResetEmailBody(user.Email, resetUrl)
        );

        _logger.LogInformation(
            "Password reset token created for user {Email} from IP {IpAddress}",
            user.Email, ipAddress
        );

        return token;
    }

    /// <summary>
    /// Validates a password reset token
    /// </summary>
    public async Task<PasswordResetToken?> ValidateTokenAsync(string token)
    {
        var resetToken = await _context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == token);

        if (resetToken == null)
        {
            _logger.LogWarning("Invalid password reset token attempted: {Token}", token);
            return null;
        }

        if (resetToken.Used)
        {
            _logger.LogWarning("Already used password reset token attempted: {TokenId}", resetToken.Id);
            return null;
        }

        if (resetToken.ExpiresAt < DateTime.UtcNow)
        {
            _logger.LogWarning("Expired password reset token attempted: {TokenId}", resetToken.Id);
            return null;
        }

        return resetToken;
    }

    /// <summary>
    /// Marks a token as used
    /// </summary>
    public async Task MarkTokenAsUsedAsync(PasswordResetToken resetToken)
    {
        resetToken.Used = true;
        resetToken.UsedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Password reset token {TokenId} marked as used for user {Email}",
            resetToken.Id, resetToken.User.Email
        );
    }

    /// <summary>
    /// Cleanup expired tokens (should be called periodically)
    /// </summary>
    public async Task CleanupExpiredTokensAsync()
    {
        var expiredTokens = await _context.PasswordResetTokens
            .Where(t => t.ExpiresAt < DateTime.UtcNow && !t.Used)
            .ToListAsync();

        if (expiredTokens.Any())
        {
            _context.PasswordResetTokens.RemoveRange(expiredTokens);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Cleaned up {Count} expired password reset tokens", expiredTokens.Count);
        }
    }

    /// <summary>
    /// Generates HTML email body for password reset
    /// </summary>
    private string GeneratePasswordResetEmailBody(string email, string resetUrl)
    {
        return $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4CAF50; color: white; padding: 20px; text-align: center; }}
        .content {{ padding: 20px; background-color: #f9f9f9; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; font-size: 12px; color: #666; }}
        .warning {{ color: #d32f2f; font-weight: bold; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Password Reset Request</h1>
        </div>
        <div class='content'>
            <p>Hello,</p>
            <p>We received a request to reset the password for your JobStream account (<strong>{email}</strong>).</p>
            <p>Click the button below to reset your password:</p>
            <p style='text-align: center;'>
                <a href='{resetUrl}' class='button'>Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style='word-break: break-all;'>{resetUrl}</p>
            <p class='warning'>This link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class='footer'>
            <p>&copy; 2025 JobStream. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";
    }
}
