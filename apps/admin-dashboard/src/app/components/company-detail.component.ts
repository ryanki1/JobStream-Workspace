import { Component, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyRegistration, MLVerificationResult, RegistrationStatus } from '@jobstream-workspace/api-types';
import { AdminApiService } from '../services/admin-api.service';

@Component({
  selector: 'app-company-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent {
  public registrationId = input<string | null>(null);
  public actionCompleted = output<void>();

  private adminApi = inject(AdminApiService);

  registration: CompanyRegistration | null = null;
  mlVerifications: MLVerificationResult[] = [];
  loading = false;
  error: string | null = null;

  // Expose enum to template
  RegistrationStatus = RegistrationStatus;

  // Action states
  verifying = false;
  approving = false;
  rejecting = false;
  rejectReason = '';

  constructor() {
    effect(() => {
      const registrationId = this.registrationId();
      if (registrationId !== null) {
        this.loadRegistrationDetails();
      }
    });
  }

  loadRegistrationDetails() {
    this.loading = true;
    this.error = null;

    this.adminApi.getRegistrationById(this.registrationId()!).subscribe({
      next: (response) => {
        this.registration = response.registration;
        this.mlVerifications = response.mlVerifications || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading registration details:', err);
        this.error = 'Failed to load registration details';
        this.loading = false;
      }
    });
  }

  triggerMLVerification() {
    if (!this.registrationId()) return;

    this.verifying = true;
    this.error = null;

    this.adminApi.triggerMLVerification(this.registrationId()!).subscribe({
      next: (result) => {
        this.mlVerifications = [result, ...this.mlVerifications];
        this.verifying = false;
        alert('ML Verification completed! Risk Score: ' + result.overallRiskScore);
      },
      error: (err) => {
        console.error('Error during ML verification:', err);
        this.error = err.error?.message || 'ML verification failed';
        this.verifying = false;
      }
    }); 
  }

  approve() {
    if (!this.registrationId()) return;

    const notes = prompt('Add approval notes (optional):');
    this.approving = true;
    this.error = null;

    this.adminApi.approveRegistration(this.registrationId()!, { notes: notes || undefined }).subscribe({
      next: () => {
        this.approving = false;
        alert('Registration approved successfully!');
        this.actionCompleted.emit();
      },
      error: (err) => {
        console.error('Error approving registration:', err);
        this.error = 'Failed to approve registration';
        this.approving = false;
      }
    });
  }

  reject() {
    if (!this.registrationId()) return;

    const reason = prompt('Rejection reason (required):');
    if (!reason || reason.trim().length < 10) {
      alert('Rejection reason must be at least 10 characters');
      return;
    }

    this.rejecting = true;
    this.error = null;

    this.adminApi.rejectRegistration(this.registrationId()!, { reason }).subscribe({
      next: () => {
        this.rejecting = false;
        alert('Registration rejected successfully!');
        this.actionCompleted.emit();
      },
      error: (err) => {
        console.error('Error rejecting registration:', err);
        this.error = 'Failed to reject registration';
        this.rejecting = false;
      }
    });
  }

  formatDate(date: string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB');
  }

  getLatestMLVerification(): MLVerificationResult | null {
    return this.mlVerifications.length > 0 ? this.mlVerifications[0] : null;
  }

  getRiskLevelClass(riskLevel: string): string {
    switch (riskLevel) {
      case 'Low':
        return 'risk-low';
      case 'Medium':
        return 'risk-medium';
      case 'High':
        return 'risk-high';
      default:
        return '';
    }
  }

  getRecommendations(mlResult: MLVerificationResult): string[] {
    if (mlResult.recommendations && mlResult.recommendations.length > 0) {
      return mlResult.recommendations;
    }
    if (mlResult.recommendationsJson) {
      try {
        return JSON.parse(mlResult.recommendationsJson);
      } catch {
        return [];
      }
    }
    return [];
  }

  getWebIntelligence(mlResult: MLVerificationResult): any {
    if (mlResult.webIntelligenceJson) {
      try {
        return JSON.parse(mlResult.webIntelligenceJson);
      } catch {
        return null;
      }
    }
    return null;
  }
}
