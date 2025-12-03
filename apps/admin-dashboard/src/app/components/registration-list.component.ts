import { Component, OnInit, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyRegistration, RegistrationStatus } from '@jobstream-workspace/api-types';
import { AdminApiService } from '../services/admin-api.service';

@Component({
  selector: 'app-registration-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registration-list.component.html',
  styleUrls: ['./registration-list.component.scss']
})
export class RegistrationListComponent implements OnInit {
  public registrationSelected = output<string>();

  private adminApi = inject(AdminApiService);

  registrations = signal<CompanyRegistration[]>([]);
  loading = false;
  error: string | null = null;

  // Expose enum to template
  RegistrationStatus = RegistrationStatus;

  ngOnInit() {
    this.loadRegistrations();
  }

  loadRegistrations() {
    this.loading = true;
    this.error = null;

    this.adminApi.getPendingRegistrations().subscribe({
      next: (response) => {
        this.registrations.set(response.data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading registrations:', err);
        this.error = 'Failed to load registrations';
        this.loading = false;
      }
    });
  }

  selectRegistration(id: string) {
    this.registrationSelected.emit(id);
  }

  getStatusLabel(status: RegistrationStatus): string {
    switch (status) {
      case RegistrationStatus.Initiated:
        return 'Email Verification Pending';
      case RegistrationStatus.EmailVerified:
        return 'Verification Pending';
      case RegistrationStatus.PendingReview:
        return 'Verification Pending';
      case RegistrationStatus.Approved:
        return 'Verification OK';
      case RegistrationStatus.Rejected:
        return 'Verification Not OK';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: RegistrationStatus): string {
    switch (status) {
      case RegistrationStatus.Initiated:
        return 'status-email-pending';
      case RegistrationStatus.EmailVerified:
      case RegistrationStatus.PendingReview:
        return 'status-verification-pending';
      case RegistrationStatus.Approved:
        return 'status-approved';
      case RegistrationStatus.Rejected:
        return 'status-rejected';
      default:
        return '';
    }
  }

  getRegistrationsByStatus(status: RegistrationStatus): CompanyRegistration[] {
    return this.registrations().filter(r => r.status === status);
  }
}
