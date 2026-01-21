import { Route } from '@angular/router';
import { VerifyEmailComponent } from './components/verify-email.component';
import { RegistrationListComponent } from './components/registration-list.component';
import { StartRegistrationComponent } from './components/start-registration.component';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from '@jobstream-workspace/shared-ui';
import { AdminStatisticsComponent } from './components/admin-statistics.component';

export const appRoutes: Route[] = [
  {
    path: 'admin',
    pathMatch: 'full',
    children: [
      {
        path: 'login',
        component: LoginComponent,
        title: 'Admin Login - JobStream',
      },
      {
        path: 'statistics',
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
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full'
  },
  {
    path: 'register', // TODO [kr] to move to company app
    pathMatch: 'full',
    children: [
      {
        path: 'start',
        component: StartRegistrationComponent,
        title: 'Registrierung starten - JobStream'
      },
      {
        path: 'verify',
        component: VerifyEmailComponent,
        title: 'E-Mail bestätigen - JobStream'
      },
      {
        path: '',
        redirectTo: '/register/start',
        pathMatch: 'full'
      }
    ]
  },
];
