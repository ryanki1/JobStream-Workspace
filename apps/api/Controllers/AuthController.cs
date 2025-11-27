using System.Collections.Concurrent;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using JobStream.Api.Data;
using JobStream.Api.Models;
using JobStream.Api.Services;
using JobStream.Api.Helpers;
using BCrypt.Net;

namespace JobStream.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly JobStreamDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IPasswordResetService _passwordResetService;
    private readonly ILogger<AuthController> _logger;

    // In-memory tracking of failed login attempts (IP-based)
    private static readonly ConcurrentDictionary<string, FailedLoginAttempts> _failedAttempts = new();

    public AuthController(
        JobStreamDbContext context,
        IJwtService jwtService,
        IPasswordResetService passwordResetService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordResetService = passwordResetService;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user account
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required" });
        }

        // Validate password strength
        if (!PasswordValidator.IsValid(request.Password, out string passwordError))
        {
            return BadRequest(new
            {
                message = passwordError,
                requirements = PasswordValidator.GetRequirements()
            });
        }

        // Check if user already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (existingUser != null)
        {
            return BadRequest(new { message = "User with this email already exists" });
        }

        // Hash password with BCrypt
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12);

        // Create new user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLower(),
            PasswordHash = passwordHash,
            Role = request.Role ?? UserRole.Freelancer, // Default to Freelancer
            CreatedAt = DateTime.UtcNow,
            IsActive = true,
            EmailVerified = false // For MVP, we skip email verification
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User registered: {UserId} ({Email}) with role {Role}",
            user.Id, user.Email, user.Role);

        // Generate JWT token
        var token = _jwtService.GenerateAccessToken(user);

        return Ok(new
        {
            message = "User registered successfully",
            userId = user.Id,
            email = user.Email,
            role = user.Role.ToString(),
            token = token
        });
    }

    /// <summary>
    /// Login with email and password (with smart brute-force protection)
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        // Validate input
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required" });
        }

        // Get client IP
        var ipAddress = GetClientIpAddress();

        // Find user by email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user == null || !user.IsActive)
        {
            // Track failed attempt even if user doesn't exist (to prevent enumeration attacks)
            await HandleFailedLoginAttempt(request.Email, ipAddress, user);
            return Unauthorized(new { message = "Invalid email or password" });
        }

        // Verify password
        var isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            await HandleFailedLoginAttempt(request.Email, ipAddress, user);
            var attempts = GetFailedAttemptCount(ipAddress);

            if (attempts >= 3)
            {
                return Unauthorized(new
                {
                    message = "Too many failed login attempts. A password reset link has been sent to your email.",
                    resetEmailSent = true,
                    attemptsRemaining = 0
                });
            }

            if (attempts >= 2)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password",
                    attemptsRemaining = 3 - attempts,
                    showPasswordReset = true // Frontend should show "Forgot Password?" link
                });
            }

            return Unauthorized(new { message = "Invalid email or password" });
        }

        // Successful login - clear failed attempts
        ClearFailedAttempts(ipAddress);

        // Update last login timestamp
        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("User logged in: {UserId} ({Email}) with role {Role}",
            user.Id, user.Email, user.Role);

        // Generate JWT token
        var token = _jwtService.GenerateAccessToken(user);

        return Ok(new
        {
            message = "Login successful",
            userId = user.Id,
            email = user.Email,
            role = user.Role.ToString(),
            token = token
        });
    }

    /// <summary>
    /// Request a password reset email
    /// </summary>
    [HttpPost("password-reset/request")]
    public async Task<IActionResult> RequestPasswordReset([FromBody] PasswordResetRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { message = "Email is required" });
        }

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        // Always return success (don't reveal if email exists - security best practice)
        if (user != null && user.IsActive)
        {
            var ipAddress = GetClientIpAddress();
            await _passwordResetService.CreatePasswordResetTokenAsync(user, ipAddress);
        }

        return Ok(new
        {
            message = "If the email address exists in our system, a password reset link will be sent shortly."
        });
    }

    /// <summary>
    /// Confirm password reset with token and new password
    /// </summary>
    [HttpPost("password-reset/confirm")]
    public async Task<IActionResult> ConfirmPasswordReset([FromBody] PasswordResetConfirm request)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Token and new password are required" });
        }

        // Validate password strength
        if (!PasswordValidator.IsValid(request.NewPassword, out string passwordError))
        {
            return BadRequest(new
            {
                message = passwordError,
                requirements = PasswordValidator.GetRequirements()
            });
        }

        // Validate token
        var resetToken = await _passwordResetService.ValidateTokenAsync(request.Token);
        if (resetToken == null)
        {
            return BadRequest(new { message = "Invalid or expired reset token" });
        }

        // Update password
        resetToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, workFactor: 12);

        // Mark token as used
        await _passwordResetService.MarkTokenAsUsedAsync(resetToken);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Password reset successful for user {Email}", resetToken.User.Email);

        return Ok(new { message = "Password reset successful. You can now login with your new password." });
    }

    // Helper methods for failed login tracking

    private async Task HandleFailedLoginAttempt(string email, string ipAddress, User? user)
    {
        var attempts = IncrementFailedAttempts(ipAddress);

        _logger.LogWarning(
            "Failed login attempt {Attempt}/3 for email {Email} from IP {IpAddress}",
            attempts, email, ipAddress
        );

        // After 3 failed attempts, automatically send password reset
        if (attempts >= 3 && user != null && user.IsActive)
        {
            _logger.LogWarning(
                "Auto-triggering password reset for {Email} after 3 failed attempts from IP {IpAddress}",
                email, ipAddress
            );

            await _passwordResetService.CreatePasswordResetTokenAsync(user, ipAddress);
        }
    }

    private int IncrementFailedAttempts(string ipAddress)
    {
        var attemptInfo = _failedAttempts.GetOrAdd(ipAddress, _ => new FailedLoginAttempts());

        lock (attemptInfo)
        {
            var now = DateTime.UtcNow;

            // Remove attempts older than 15 minutes
            attemptInfo.Timestamps.RemoveAll(t => now - t > TimeSpan.FromMinutes(15));

            // Add new attempt
            attemptInfo.Timestamps.Add(now);

            return attemptInfo.Timestamps.Count;
        }
    }

    private int GetFailedAttemptCount(string ipAddress)
    {
        if (!_failedAttempts.TryGetValue(ipAddress, out var attemptInfo))
            return 0;

        lock (attemptInfo)
        {
            var now = DateTime.UtcNow;
            attemptInfo.Timestamps.RemoveAll(t => now - t > TimeSpan.FromMinutes(15));
            return attemptInfo.Timestamps.Count;
        }
    }

    private void ClearFailedAttempts(string ipAddress)
    {
        _failedAttempts.TryRemove(ipAddress, out _);
    }

    private string GetClientIpAddress()
    {
        // Try to get real IP from X-Forwarded-For header (for proxies/load balancers)
        var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',')[0].Trim();
        }

        // Fall back to remote IP
        return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    // Helper class for tracking failed attempts
    private class FailedLoginAttempts
    {
        public List<DateTime> Timestamps { get; set; } = new();
    }
}

/// <summary>
/// Request model for user registration
/// </summary>
public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public UserRole? Role { get; set; }
}

/// <summary>
/// Request model for user login
/// </summary>
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

/// <summary>
/// Request model for password reset request
/// </summary>
public class PasswordResetRequest
{
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Request model for password reset confirmation
/// </summary>
public class PasswordResetConfirm
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
