import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RegistrationListComponent } from './components/registration-list.component';
import { CompanyDetailComponent } from './components/company-detail.component';

@Component({
  imports: [RouterModule, RegistrationListComponent, CompanyDetailComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  selectedRegistrationId: string | null = null;

  onRegistrationSelected(id: string) {
    this.selectedRegistrationId = id;
  }

  onActionCompleted() {
    // Reload the list
    this.selectedRegistrationId = null;
    // The list component will reload automatically
  }
}
