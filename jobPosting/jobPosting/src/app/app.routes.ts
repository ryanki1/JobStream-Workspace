import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'create-job',
    loadComponent: () => import('./components/create-job/create-job.component').then(m => m.CreateJobComponent)
  },
  {
    path: 'job-list',
    loadComponent: () => import('./components/job-list/job-list.component').then(m => m.JobListComponent)
  },
  {
    path: '',
    redirectTo: 'create-job',
    pathMatch: 'full'
  }
];
