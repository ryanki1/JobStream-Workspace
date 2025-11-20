import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CompanyRegistration,
  PaginatedResponse,
  AdminStatistics,
  MLVerificationResult,
  ApproveRegistrationRequest,
  RejectRegistrationRequest,
  RegistrationDetailResponse
} from '@jobstream/api-types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl || 'http://localhost:5000/api';

  /**
   * Get pending company registrations
   */
  getPendingRegistrations(page: number = 1, pageSize: number = 20): Observable<PaginatedResponse<CompanyRegistration>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PaginatedResponse<CompanyRegistration>>(
      `${this.baseUrl}/admin/registrations/pending`,
      { params }
    );
  }

  /**
   * Get registration details by ID
   */
  getRegistrationById(id: string): Observable<RegistrationDetailResponse> {
    return this.http.get<RegistrationDetailResponse>(
      `${this.baseUrl}/admin/registrations/${id}`
    );
  }

  /**
   * Trigger ML verification
   */
  triggerMLVerification(id: string): Observable<MLVerificationResult> {
    return this.http.post<MLVerificationResult>(
      `${this.baseUrl}/admin/registrations/${id}/verify-ml`,
      {}
    );
  }

  /**
   * Get ML verification history
   */
  getMLVerificationHistory(id: string): Observable<MLVerificationResult[]> {
    return this.http.get<any>(
      `${this.baseUrl}/admin/registrations/${id}/ml-history`
    ).pipe(
      // Extract verifications array from response
      // Backend returns: { registrationId, verificationCount, verifications }
    );
  }

  /**
   * Approve registration
   */
  approveRegistration(id: string, request?: ApproveRegistrationRequest): Observable<CompanyRegistration> {
    return this.http.post<CompanyRegistration>(
      `${this.baseUrl}/admin/registrations/${id}/approve`,
      request || {}
    );
  }

  /**
   * Reject registration
   */
  rejectRegistration(id: string, request: RejectRegistrationRequest): Observable<CompanyRegistration> {
    return this.http.post<CompanyRegistration>(
      `${this.baseUrl}/admin/registrations/${id}/reject`,
      request
    );
  }

  /**
   * Get admin statistics
   */
  getStatistics(): Observable<AdminStatistics> {
    return this.http.get<AdminStatistics>(
      `${this.baseUrl}/admin/statistics`
    );
  }
}
