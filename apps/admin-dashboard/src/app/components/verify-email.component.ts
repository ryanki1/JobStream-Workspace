import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyRegistrationService } from '../services/company-registration.service';

/**
 * Email Verification Component
 *
 * This component handles the email verification step of the company registration process.
 * It reads the registration ID and verification token from URL query parameters and
 * automatically verifies the email with the backend API.
 *
 * URL Format: /register/verify?id={registrationId}&token={verificationToken}
 *
 * States:
 * - Loading: Verification in progress
 * - Success: Email successfully verified
 * - Error: Verification failed (expired, invalid, or already used)
 * - Missing Parameters: Invalid URL (missing id or token)
 */
@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private registrationService = inject(CompanyRegistrationService);

  // Signals for reactive state management
  isVerifying = signal(false);
  verificationSuccess = signal(false);
  verificationError = signal(false);
  missingParameters = signal(false);
  errorMessage = signal('');

  private registrationId = '';
  private token = '';

  ngOnInit() {
    // Get parameters from URL query string
    this.route.queryParams.subscribe(params => {
      this.registrationId = params['id'] || '';
      this.token = params['token'] || '';

      // Check if required parameters are present
      if (!this.registrationId || !this.token) {
        this.missingParameters.set(true);
        return;
      }

      // Start verification process automatically
      this.verifyEmail();
    });
  }

  /**
   * Verify email with backend API
   */
  private verifyEmail() {
    this.isVerifying.set(true);
    this.verificationError.set(false);
    this.verificationSuccess.set(false);

    this.registrationService.verifyEmail(this.registrationId, this.token)
      .subscribe({
        next: (response) => {
          this.isVerifying.set(false);
          if (response.verified) {
            this.verificationSuccess.set(true);
            // Store registration ID in session storage for next steps
            sessionStorage.setItem('registrationId', this.registrationId);
          } else {
            this.verificationError.set(true);
            this.errorMessage.set('Die E-Mail-Verifizierung ist fehlgeschlagen.');
          }
        },
        error: (error) => {
          this.isVerifying.set(false);
          this.verificationError.set(true);

          // Parse error message from API response
          if (error.error?.message) {
            this.errorMessage.set(error.error.message);
          } else if (error.status === 400) {
            this.errorMessage.set('Der Verifizierungslink ist ungültig oder abgelaufen.');
          } else if (error.status === 404) {
            this.errorMessage.set('Die Registrierung wurde nicht gefunden.');
          } else {
            this.errorMessage.set('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
          }

          console.error('Email verification error:', error);
        }
      });
  }

  /**
   * Navigate to company details step after successful verification
   */
  continueRegistration() {
    this.router.navigate(['/register/company-details'], {
      queryParams: { id: this.registrationId }
    });
  }

  /**
   * Request a new verification email (to be implemented)
   */
  requestNewVerificationEmail() {
    // TODO: Implement resend verification email functionality
    // This would call a new API endpoint to resend the verification email
    alert('Funktion wird in Kürze verfügbar sein.');
  }

  /**
   * Navigate back to home page
   */
  goToHome() {
    this.router.navigate(['/']);
  }
}
