import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { UserInfo } from '../models/user-info.model';

@Injectable({
  providedIn: 'root',
})
export class AuthCandidateService {
  private readonly API_URL = 'http://localhost:5252/api';

  // Signal für reaktiven State (Angular 20)
  public currentUser = signal<UserInfo | null>(null);
  public isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  /**
   * Prüft den Login-Status beim Backend.
   * WICHTIG: HttpClient muss mit withCredentials konfiguriert sein,
   * damit Cookie mitgesendet wird!
   */
  checkAuthStatus(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.API_URL}/user/me`).pipe(
      tap((userInfo) => {
        this.currentUser.set(userInfo);
        this.isAuthenticated.set(userInfo.isAuthenticated);
      }),
      catchError((error) => {
        // Bei Fehler (kein Cookie, CORS, etc.) als nicht-authentifiziert behandeln
        console.warn(
          'Auth check failed, treating as not authenticated:',
          error
        );
        const notAuthenticatedUser: UserInfo = { isAuthenticated: false };
        this.currentUser.set(notAuthenticatedUser);
        this.isAuthenticated.set(false);
        return of(notAuthenticatedUser);
      })
    );
  }

  /**
   * Initiiert Google Login.
   * Redirect zum Backend OAuth Endpunkt.
   */
  login(): void {
    // Full Page Redirect zum Backend
    window.location.href = `${this.API_URL}/authCandidate/login`;
  }

  /**
   * Logout User.
   * Backend löscht Authentication Cookie.
   */
  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/authCandidate/logout`, {}).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
      })
    );
  }

  /**
   * Beispiel für geschützten API-Call.
   */
  getProfile(): Observable<any> {
    return this.http.get(`${this.API_URL}/userCompany/profile`);
  }
}
