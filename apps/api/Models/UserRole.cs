namespace JobStream.Api.Models;

/// <summary>
/// Defines user roles in the JobStream system
/// </summary>
public enum UserRole
{
    /// <summary>
    /// Administrator with full system access
    /// </summary>
    Admin = 0,

    /// <summary>
    /// Company user who can post jobs
    /// </summary>
    Company = 1,

    /// <summary>
    /// Freelancer who can apply to jobs
    /// </summary>
    Freelancer = 2
}
