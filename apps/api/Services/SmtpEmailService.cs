using System.Net;
using System.Net.Mail;
using System.Text;

namespace JobStream.Api.Services;

public class SmtpEmailService : IEmailService
{
    private readonly ILogger<SmtpEmailService> _logger;
    private readonly IConfiguration _configuration;
    private readonly string _smtpHost;
    private readonly int _smtpPort;
    private readonly string _smtpUsername;
    private readonly string _smtpPassword;
    private readonly bool _enableSsl;
    private readonly string _fromAddress;
    private readonly string _fromName;
    private readonly string _verificationUrlBase;

    public SmtpEmailService(
        ILogger<SmtpEmailService> logger,
        IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;

        // Load SMTP configuration
        _smtpHost = configuration["Email:Smtp:Host"]
            ?? throw new InvalidOperationException("SMTP Host is not configured");
        _smtpPort = configuration.GetValue<int>("Email:Smtp:Port", 587);
        _smtpUsername = configuration["Email:Smtp:Username"]
            ?? throw new InvalidOperationException("SMTP Username is not configured");
        _smtpPassword = configuration["Email:Smtp:Password"]
            ?? throw new InvalidOperationException("SMTP Password is not configured");
        _enableSsl = configuration.GetValue<bool>("Email:Smtp:EnableSsl", true);

        _fromAddress = configuration["Email:FromAddress"] ?? "noreply@jobstream.com";
        _fromName = configuration["Email:FromName"] ?? "JobStream";
        _verificationUrlBase = configuration["Email:VerificationUrlBase"]
            ?? "http://localhost:4200/register/verify";

        _logger.LogInformation(
            "SmtpEmailService initialized. Host: {Host}, Port: {Port}, SSL: {SSL}",
            _smtpHost, _smtpPort, _enableSsl);
    }

    public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = false)
    {
        try
        {
            _logger.LogInformation("Sending email to {To} with subject: {Subject}", to, subject);
            
            using var smtpClient = new SmtpClient(_smtpHost, _smtpPort)
            {
                Credentials = new NetworkCredential(_smtpUsername, _smtpPassword),
                EnableSsl = _enableSsl,
                UseDefaultCredentials = false,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                Timeout = 30000 // 30 seconds
            };

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(_fromAddress, _fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = isHtml,
                BodyEncoding = Encoding.UTF8,
                SubjectEncoding = Encoding.UTF8
            };

            mailMessage.To.Add(to);

            await smtpClient.SendMailAsync(mailMessage);

            _logger.LogInformation("Email sent successfully to {To}", to);
        }
        catch (SmtpException ex)
        {
            _logger.LogError(ex, "SMTP error sending email to {To}: {Message}", to, ex.Message);
            throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error sending email to {To}", to);
            throw;
        }
    }

    public async Task SendEmailVerificationAsync(
        string to,
        string companyName,
        Guid registrationId,
        string verificationToken)
    {
        var verificationUrl = $"{_verificationUrlBase}?token={verificationToken}&id={registrationId}";

        var subject = "Bestätigen Sie Ihre E-Mail-Adresse - JobStream Registrierung";

        var htmlBody = $@"
<!DOCTYPE html>
<html lang=""de"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{subject}</title>
</head>
<body style=""margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"">
    <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: #f4f4f4; padding: 20px 0;"">
        <tr>
            <td align=""center"">
                <table width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"">
                    <!-- Header -->
                    <tr>
                        <td style=""background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;"">
                            <h1 style=""color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;"">JobStream</h1>
                            <p style=""color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;"">Willkommen bei JobStream</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style=""padding: 40px 30px;"">
                            <h2 style=""color: #333333; margin: 0 0 20px 0; font-size: 24px;"">Hallo {companyName},</h2>

                            <p style=""color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"">
                                vielen Dank für Ihre Registrierung bei JobStream! Um fortzufahren, müssen Sie Ihre E-Mail-Adresse bestätigen.
                            </p>

                            <p style=""color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;"">
                                Klicken Sie auf den Button unten, um Ihre E-Mail-Adresse zu verifizieren:
                            </p>

                            <!-- CTA Button -->
                            <table width=""100%"" cellpadding=""0"" cellspacing=""0"">
                                <tr>
                                    <td align=""center"" style=""padding: 0 0 30px 0;"">
                                        <a href=""{verificationUrl}""
                                           style=""display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"">
                                            E-Mail bestätigen
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style=""color: #999999; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;"">
                                Oder kopieren Sie diesen Link in Ihren Browser:
                            </p>

                            <p style=""background-color: #f8f9fa; padding: 15px; border-radius: 4px; word-break: break-all; font-size: 14px; color: #666666; margin: 0 0 30px 0;"">
                                {verificationUrl}
                            </p>

                            <!-- Info Box -->
                            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: #fff3cd; border-left: 4px solid #ffc107; margin: 0 0 30px 0;"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""color: #856404; font-size: 14px; line-height: 1.6; margin: 0;"">
                                            <strong>⚠️ Wichtig:</strong> Dieser Verifizierungslink ist 24 Stunden gültig.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style=""color: #666666; font-size: 14px; line-height: 1.6; margin: 0;"">
                                <strong>Registrierungs-ID:</strong> <code style=""background-color: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-family: monospace;"">{registrationId}</code>
                            </p>

                            <hr style=""border: none; border-top: 1px solid #eeeeee; margin: 30px 0;"">

                            <p style=""color: #999999; font-size: 13px; line-height: 1.6; margin: 0;"">
                                Falls Sie diese Registrierung nicht angefordert haben, können Sie diese E-Mail ignorieren.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style=""background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;"">
                            <p style=""color: #999999; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;"">
                                Mit freundlichen Grüßen,<br>
                                <strong>Das JobStream Team</strong>
                            </p>
                            <p style=""color: #cccccc; font-size: 12px; margin: 0;"">
                                © {DateTime.UtcNow.Year} JobStream. Alle Rechte vorbehalten.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

        var plainTextBody = $@"
Hallo {companyName},

vielen Dank für Ihre Registrierung bei JobStream!

Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie den folgenden Link in Ihrem Browser öffnen:
{verificationUrl}

Dieser Verifizierungslink ist 24 Stunden gültig.

Registrierungs-ID: {registrationId}

Falls Sie diese Registrierung nicht angefordert haben, können Sie diese E-Mail ignorieren.

Mit freundlichen Grüßen,
Das JobStream Team
";

        _logger.LogInformation(
            "Sending email verification to {To} for {CompanyName} (ID: {RegistrationId})",
            to, companyName, registrationId);

        try
        {
            await SendEmailAsync(to, subject, htmlBody, isHtml: true);
        }
        catch (Exception)
        {
            // Fallback to plain text if HTML fails
            _logger.LogWarning("HTML email failed, falling back to plain text");
            await SendEmailAsync(to, subject, plainTextBody, isHtml: false);
        }
    }

    public async Task SendRegistrationConfirmationAsync(
        string to,
        string companyName,
        Guid registrationId)
    {
        var subject = "Registrierung erfolgreich eingereicht - JobStream";

        var htmlBody = $@"
<!DOCTYPE html>
<html lang=""de"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{subject}</title>
</head>
<body style=""margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"">
    <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: #f4f4f4; padding: 20px 0;"">
        <tr>
            <td align=""center"">
                <table width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"">
                    <!-- Header -->
                    <tr>
                        <td style=""background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 40px 30px; text-align: center;"">
                            <h1 style=""color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;"">✓ Erfolgreich eingereicht!</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style=""padding: 40px 30px;"">
                            <h2 style=""color: #333333; margin: 0 0 20px 0; font-size: 24px;"">Hallo {companyName},</h2>

                            <p style=""color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;"">
                                Ihre Registrierung wurde erfolgreich zur Überprüfung eingereicht!
                            </p>

                            <!-- Info Card -->
                            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: #f8f9fa; border-radius: 6px; margin: 0 0 30px 0;"">
                                <tr>
                                    <td style=""padding: 25px;"">
                                        <p style=""color: #666666; font-size: 14px; margin: 0 0 10px 0;"">
                                            <strong>Registrierungs-ID:</strong>
                                        </p>
                                        <p style=""font-family: monospace; font-size: 14px; color: #667eea; margin: 0 0 20px 0; word-break: break-all;"">
                                            {registrationId}
                                        </p>

                                        <p style=""color: #666666; font-size: 14px; margin: 0 0 10px 0;"">
                                            <strong>Firmenname:</strong>
                                        </p>
                                        <p style=""font-size: 14px; color: #333333; margin: 0 0 20px 0;"">
                                            {companyName}
                                        </p>

                                        <p style=""color: #666666; font-size: 14px; margin: 0 0 10px 0;"">
                                            <strong>Status:</strong>
                                        </p>
                                        <p style=""font-size: 14px; margin: 0;"">
                                            <span style=""display: inline-block; padding: 6px 12px; background-color: #ffc107; color: #000000; border-radius: 4px; font-weight: bold;"">
                                                Wird überprüft
                                            </span>
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <h3 style=""color: #333333; margin: 0 0 15px 0; font-size: 18px;"">Was passiert als Nächstes?</h3>

                            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""margin: 0 0 30px 0;"">
                                <tr>
                                    <td style=""padding: 15px 0; border-bottom: 1px solid #eeeeee;"">
                                        <p style=""color: #667eea; font-weight: bold; margin: 0 0 5px 0; font-size: 14px;"">
                                            1️⃣ Überprüfung Ihrer Unterlagen
                                        </p>
                                        <p style=""color: #999999; font-size: 13px; margin: 0;"">
                                            Unser Team prüft sorgfältig alle eingereichten Dokumente und Informationen.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 15px 0; border-bottom: 1px solid #eeeeee;"">
                                        <p style=""color: #667eea; font-weight: bold; margin: 0 0 5px 0; font-size: 14px;"">
                                            2️⃣ Verifizierung der Unternehmensdaten
                                        </p>
                                        <p style=""color: #999999; font-size: 13px; margin: 0;"">
                                            Wir überprüfen Ihre Firmendaten und finanziellen Angaben.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style=""padding: 15px 0;"">
                                        <p style=""color: #667eea; font-weight: bold; margin: 0 0 5px 0; font-size: 14px;"">
                                            3️⃣ Benachrichtigung per E-Mail
                                        </p>
                                        <p style=""color: #999999; font-size: 13px; margin: 0;"">
                                            Sie erhalten eine E-Mail, sobald die Überprüfung abgeschlossen ist.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Timeline Box -->
                            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: #e3f2fd; border-left: 4px solid #2196f3; margin: 0 0 30px 0;"">
                                <tr>
                                    <td style=""padding: 15px;"">
                                        <p style=""color: #1565c0; font-size: 14px; line-height: 1.6; margin: 0;"">
                                            <strong>⏱️ Geschätzte Bearbeitungszeit:</strong> 24-48 Stunden
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style=""color: #666666; font-size: 14px; line-height: 1.6; margin: 0;"">
                                Bei Fragen können Sie sich jederzeit an unser Support-Team wenden.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style=""background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;"">
                            <p style=""color: #999999; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;"">
                                Mit freundlichen Grüßen,<br>
                                <strong>Das JobStream Team</strong>
                            </p>
                            <p style=""color: #cccccc; font-size: 12px; margin: 0;"">
                                © {DateTime.UtcNow.Year} JobStream. Alle Rechte vorbehalten.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

        _logger.LogInformation(
            "Sending registration confirmation to {To} for {CompanyName} (ID: {RegistrationId})",
            to, companyName, registrationId);

        await SendEmailAsync(to, subject, htmlBody, isHtml: true);
    }

    public async Task SendStatusUpdateAsync(
        string to,
        string companyName,
        string status,
        string? notes = null)
    {
        var subject = $"Status-Update Ihrer Registrierung - {status}";

        var statusColor = status.ToLower() switch
        {
            "approved" => "#28a745",
            "rejected" => "#dc3545",
            _ => "#ffc107"
        };

        var statusText = status.ToLower() switch
        {
            "approved" => "Genehmigt ✓",
            "rejected" => "Abgelehnt",
            _ => status
        };

        var htmlBody = $@"
<!DOCTYPE html>
<html lang=""de"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{subject}</title>
</head>
<body style=""margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;"">
    <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: #f4f4f4; padding: 20px 0;"">
        <tr>
            <td align=""center"">
                <table width=""600"" cellpadding=""0"" cellspacing=""0"" style=""background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"">
                    <!-- Header -->
                    <tr>
                        <td style=""background-color: {statusColor}; padding: 40px 30px; text-align: center;"">
                            <h1 style=""color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;"">Status-Update</h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style=""padding: 40px 30px;"">
                            <h2 style=""color: #333333; margin: 0 0 20px 0; font-size: 24px;"">Hallo {companyName},</h2>

                            <p style=""color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;"">
                                der Status Ihrer Unternehmensregistrierung wurde aktualisiert:
                            </p>

                            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: #f8f9fa; border-radius: 6px; margin: 0 0 30px 0;"">
                                <tr>
                                    <td style=""padding: 25px; text-align: center;"">
                                        <p style=""font-size: 18px; margin: 0 0 10px 0; color: #666666;"">
                                            Neuer Status:
                                        </p>
                                        <p style=""font-size: 24px; font-weight: bold; margin: 0; color: {statusColor};"">
                                            {statusText}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            {(notes != null ? $@"
                            <h3 style=""color: #333333; margin: 0 0 15px 0; font-size: 18px;"">Anmerkungen:</h3>
                            <table width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color: #f8f9fa; border-left: 4px solid {statusColor}; margin: 0 0 30px 0;"">
                                <tr>
                                    <td style=""padding: 20px;"">
                                        <p style=""color: #666666; font-size: 14px; line-height: 1.6; margin: 0;"">
                                            {notes}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            " : "")}

                            <p style=""color: #666666; font-size: 14px; line-height: 1.6; margin: 0;"">
                                Bei Fragen wenden Sie sich bitte an unser Support-Team.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style=""background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;"">
                            <p style=""color: #999999; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;"">
                                Mit freundlichen Grüßen,<br>
                                <strong>Das JobStream Team</strong>
                            </p>
                            <p style=""color: #cccccc; font-size: 12px; margin: 0;"">
                                © {DateTime.UtcNow.Year} JobStream. Alle Rechte vorbehalten.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";

        _logger.LogInformation(
            "Sending status update to {To} for {CompanyName}. Status: {Status}",
            to, companyName, status);

        await SendEmailAsync(to, subject, htmlBody, isHtml: true);
    }
}
