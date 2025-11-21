import { Route } from '@angular/router';
import { VerifyEmailComponent } from './components/verify-email.component';

export const appRoutes: Route[] = [
  {
    path: 'register/verify',
    component: VerifyEmailComponent,
    title: 'E-Mail bestätigen - JobStream'
  },
  {
    path: '',
    redirectTo: '/register/verify',
    pathMatch: 'full'
  }
];
