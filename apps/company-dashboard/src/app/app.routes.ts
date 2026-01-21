import { Route } from '@angular/router';
import { JobListComponent } from './components/job-list/job-list.component';
import { CreateJobComponent } from './components/create-job/create-job.component';
import { LoginCompanyComponent } from './components/login/login-company.component';

export const appRoutes: Route[] = [
  {
    path: 'company',
    title: 'Company',
    children: [
      {
        path: 'job-list',
        component: JobListComponent,
        title: 'Job Posting List',
      },
      {
        path: 'job-create',
        component: CreateJobComponent,
        title: 'Create Job Posting',
      },
      {
        path: 'login', // TODO [kr] to move to own candidate app & candidate routes
        component: LoginCompanyComponent,
        title: 'Company Login - JobStream',
        pathMatch: 'full',
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
