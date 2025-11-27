namespace JobStream.Api.Helpers;

/// <summary>
/// Helper class for password validation
/// </summary>
public static class PasswordValidator
{
    /// <summary>
    /// Validates password strength according to security requirements
    /// </summary>
    /// <param name="password">Password to validate</param>
    /// <param name="errorMessage">Error message if validation fails</param>
    /// <returns>True if password is valid, false otherwise</returns>
    public static bool IsValid(string password, out string errorMessage)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            errorMessage = "Password is required";
            return false;
        }

        if (password.Length < 8)
        {
            errorMessage = "Password must be at least 8 characters long";
            return false;
        }

        if (!password.Any(char.IsUpper))
        {
            errorMessage = "Password must contain at least one uppercase letter";
            return false;
        }

        if (!password.Any(char.IsLower))
        {
            errorMessage = "Password must contain at least one lowercase letter";
            return false;
        }

        if (!password.Any(char.IsDigit))
        {
            errorMessage = "Password must contain at least one number";
            return false;
        }

        errorMessage = string.Empty;
        return true;
    }

    /// <summary>
    /// Gets a list of password requirements as user-friendly strings
    /// </summary>
    public static List<string> GetRequirements()
    {
        return new List<string>
        {
            "At least 8 characters long",
            "Contains at least one uppercase letter (A-Z)",
            "Contains at least one lowercase letter (a-z)",
            "Contains at least one number (0-9)"
        };
    }
}
