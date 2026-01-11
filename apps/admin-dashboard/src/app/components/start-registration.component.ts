import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyRegistrationService } from '../services/company-registration.service';

@Component({
  selector: 'app-start-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './start-registration.component.html',
  styleUrls: ['./start-registration.component.scss']
})
export class StartRegistrationComponent {
  registrationForm: FormGroup;
  isSubmitting = signal(false);
  submitted = signal(false);
  registrationId = signal('');
  errorMessage = signal('');

  // List of free email providers to reject
  private freeEmailProviders = [
    'gmail.com', 'googlemailx.com', 'yahoo.com', 'yahoo.de',
    'hotmail.com', 'outlook.com', 'live.com', 'gmx.de', 'gmx.net',
    'web.de', 't-online.de', 'freenet.de', 'aol.com'
  ];

  constructor(
    private fb: FormBuilder,
    private registrationService: CompanyRegistrationService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      companyEmail: ['', [
        Validators.required,
        Validators.email,
        this.businessEmailValidator.bind(this)
      ]],
      primaryContactName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]]
    });
  }

  // Custom validator to ensure business email (not free provider)
  private businessEmailValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const email = control.value.toLowerCase();
    const domain = email.split('@')[1];

    if (this.freeEmailProviders.includes(domain)) {
      return { freeEmailProvider: true };
    }

    return null;
  }

  get companyEmail() {
    return this.registrationForm.get('companyEmail');
  }

  get primaryContactName() {
    return this.registrationForm.get('primaryContactName');
  }

  onSubmit() {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formValue = this.registrationForm.value;

    this.registrationService.startRegistration({
      companyEmail: formValue.companyEmail,
      primaryContactName: formValue.primaryContactName
    }).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.submitted.set(true);
        this.registrationId.set(response.registrationId);

        // Store registration ID in session storage for later steps
        sessionStorage.setItem('registrationId', response.registrationId);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('Registration error:', error);

        if (error.status === 400 && error.error?.code === 'VALIDATION_ERROR') {
          this.errorMessage.set(error.error.message || 'Die eingegebenen Daten sind ungültig.');
        } else if (error.status === 409 && error.error?.code === 'EMAIL_ALREADY_REGISTERED') {
          this.errorMessage.set('Diese E-Mail-Adresse ist bereits registriert.');
        } else {
          this.errorMessage.set('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
        }
      }
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}
