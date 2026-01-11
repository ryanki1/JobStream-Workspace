import { Route } from '@angular/router';
import { VerifyEmailComponent } from './components/verify-email.component';
import { RegistrationListComponent } from './components/registration-list.component';
import { StartRegistrationComponent } from './components/start-registration.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from '@jobstream-workspace/shared-ui';
import { AdminStatisticsComponent } from './components/admin-statistics.component';
import { LoginCandidateComponent } from './components/login-candidate.component';

export const appRoutes: Route[] = [
   {
    path: 'admin-login',
    component: LoginComponent,
    title: 'Admin Login - JobStream',
  },
  {
    path: 'candidate-login',
    component: LoginCandidateComponent,
    title: 'Company Login - JobStream',
  },
  {
    path: 'admin-statistics',
    component: AdminStatisticsComponent,
    canActivate: [authGuard],
    title: 'Admin - JobStream - Statistics'
  },
  {
    path: 'admin-list',
    component: RegistrationListComponent,
    canActivate: [authGuard],
    title: 'Admin - JobStream'
  },
  {
    path: 'admin',
    redirectTo: '/admin-statistics',
    pathMatch: 'full'
  },
  {
    path: 'register',
    redirectTo: '/register/start',
    pathMatch: 'full'
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
