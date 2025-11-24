import { Route } from '@angular/router';
import { VerifyEmailComponent } from './components/verify-email.component';
import { RegistrationListComponent } from './components/registration-list.component';
import { StartRegistrationComponent } from './components/start-registration.component';

export const appRoutes: Route[] = [
  {
    path: 'admin',
    component: RegistrationListComponent,
    title: 'Admin - JobStream'
  },
  {
    path: 'register/start',
    component: StartRegistrationComponent,
    title: 'Registrierung starten - JobStream'
  },
  {
    path: 'register/verify',
    component: VerifyEmailComponent,
    title: 'E-Mail bestätigen - JobStream'
  },
  {
    path: '',
    redirectTo: '/register/start',
    pathMatch: 'full'
  }
];
