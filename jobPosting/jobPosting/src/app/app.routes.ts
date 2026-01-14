import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'create-job',
    loadComponent: () => import('./components/create-job/create-job.component').then(m => m.CreateJobComponent)
  },
  {
    path: '',
    redirectTo: 'create-job',
    pathMatch: 'full'
  }
];
