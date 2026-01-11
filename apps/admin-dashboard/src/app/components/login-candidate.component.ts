import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthCandidateService } from '../services/auth-candidate.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-container">
      <h1>OAuth 2.0 Google Login - BFF Pattern</h1>

      @if (loading()) {
        <div class="loading">Loading...</div>
      }

      @if (!authService.isAuthenticated()) {
        <div class="login-section">
          <p>Sie sind nicht eingeloggt.</p>
          <button (click)="login()" class="login-btn">
            Mit Google anmelden
          </button>
        </div>
      } @else {
        <div class="user-section">
          <h2>Willkommen!</h2>

          @if (authService.currentUser(); as user) {
            <div class="user-info">
              @if (user.picture) {
                <img [src]="user.picture" alt="Profile" class="profile-pic" />
              }
              <p><strong>Name:</strong> {{ user.name }}</p>
              <p><strong>Email:</strong> {{ user.email }}</p>
              <p><strong>ID:</strong> {{ user.id }}</p>
            </div>
          }

          <button (click)="logout()" class="logout-btn">
            Abmelden
          </button>

          <button (click)="loadProfile()" class="profile-btn">
            Geschütztes Profil laden
          </button>

          @if (profileData()) {
            <div class="profile-data">
              <h3>Profil-Daten (geschützter Endpunkt):</h3>
              <pre>{{ profileData() | json }}</pre>
            </div>
          }
        </div>
      }

      @if (error()) {
        <div class="error">{{ error() }}</div>
      }
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    h1 {
      color: #333;
      border-bottom: 2px solid #4285f4;
      padding-bottom: 10px;
    }

    .login-btn, .logout-btn, .profile-btn {
      padding: 12px 24px;
      margin: 10px 5px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }

    .login-btn {
      background-color: #4285f4;
      color: white;
    }

    .login-btn:hover {
      background-color: #357ae8;
    }

    .logout-btn {
      background-color: #db4437;
      color: white;
    }

    .logout-btn:hover {
      background-color: #c23321;
    }

    .profile-btn {
      background-color: #0f9d58;
      color: white;
    }

    .profile-btn:hover {
      background-color: #0b8043;
    }

    .user-info {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .profile-pic {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      margin-bottom: 15px;
    }

    .user-info p {
      margin: 10px 0;
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    .error {
      background-color: #f8d7da;
      color: #721c24;
      padding: 12px;
      border-radius: 4px;
      margin-top: 20px;
    }

    .profile-data {
      margin-top: 20px;
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 4px;
    }

    .profile-data pre {
      overflow-x: auto;
      font-size: 12px;
    }
  `]
})
export class LoginCandidateComponent implements OnInit {
  loading = signal(false);
  error = signal<string | null>(null);
  profileData = signal<any>(null);

  constructor(public authService: AuthCandidateService) {}

  ngOnInit(): void {
    this.checkAuth();
  }

  checkAuth(): void {
    this.loading.set(true);
    this.error.set(null); // Vorherigen Fehler zurücksetzen
    this.authService.checkAuthStatus().subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        // Bei 401/403 oder CORS-Fehler ist das erwartet beim ersten Laden
        console.warn('Auth check failed (expected on first load):', err);
        // Kein Error anzeigen, wenn einfach kein Cookie vorhanden ist
        if (err.status !== 401 && err.status !== 0) {
          this.error.set('Fehler beim Laden des Auth-Status: ' + err.message);
        }
      }
    });
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.profileData.set(null);
      },
      error: (err) => {
        this.error.set('Logout fehlgeschlagen: ' + err.message);
      }
    });
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profileData.set(data);
      },
      error: (err) => {
        this.error.set('Fehler beim Laden des Profils: ' + err.message);
      }
    });
  }
}