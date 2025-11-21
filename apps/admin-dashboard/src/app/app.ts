import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { RegistrationListComponent } from './components/registration-list.component';
import { CompanyDetailComponent } from './components/company-detail.component';

@Component({
  imports: [CommonModule, RouterModule, RegistrationListComponent, CompanyDetailComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  selectedRegistrationId: string | null = null;
  showAdminLayout = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check current route on init
    this.checkRoute(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkRoute(event.urlAfterRedirects);
      });
  }

  private checkRoute(url: string) {
    // Hide admin layout for public registration routes
    this.showAdminLayout = url.startsWith('/admin');
  }

  onRegistrationSelected(id: string) {
    this.selectedRegistrationId = id;
  }

  onActionCompleted() {
    // Reload the list
    this.selectedRegistrationId = null;
    // The list component will reload automatically
  }
}
